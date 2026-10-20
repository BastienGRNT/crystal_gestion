import { beforeEach, describe, expect, it } from 'vitest';
import {
	FakeAccess,
	FixedClock,
	MemoryTable,
	RecordingActivity,
	RecordingFeed,
	RecordingNotifier,
	testId
} from '../../kernel/testing';
import type { Component } from '../domain/component';
import type { Task } from '../domain/task';
import { createTasks } from '../index';

function setup() {
	const table = new MemoryTable<Task>();
	const modules = new MemoryTable<Component>();
	const counters = new Map<string, number>();
	const feed = new RecordingFeed<Task>();
	const activity = new RecordingActivity();
	const notifier = new RecordingNotifier();
	const steps = new Map<string, { projectId: string; closedAt: string | null }>([
		['m1', { projectId: 'p1', closedAt: '2026-10-01T10:00:00Z' }],
		['m2', { projectId: 'p1', closedAt: null }],
		['other', { projectId: 'p2', closedAt: null }]
	]);
	const tasks = createTasks({
		milestones: { get: async (id) => steps.get(id) ?? null, current: async () => 'm2' },
		framing: { story: async () => null, epic: async () => null },
		clock: new FixedClock(),
		feed,
		activity,
		notifier,
		access: new FakeAccess({ p1: ['bastien', 'ana'], p2: ['paul'] }),
		components: {
			ofProjects: async (ids) => modules.all().filter((c) => ids.includes(c.projectId)),
			ofProject: async (id) => modules.all().filter((c) => c.projectId === id),
			get: async (id) => modules.get(id),
			put: async (c) => modules.put(c),
			delete: async (id) => modules.delete(id)
		},
		componentFeed: new RecordingFeed<Component>(),
		tasks: {
			ofProjects: async () => table.all(),
			ofMilestone: async (id) => table.all().filter((t) => t.milestoneId === id),
			ofRelease: async (id) => table.all().filter((t) => t.releaseId === id),
			get: async (id: string) => table.get(id),
			insert: async (task) => table.put(task),
			save: async (task) => table.put(task),
			delete: async (id: string) => table.delete(id),
			nextNumber: async (projectId) => {
				counters.set(projectId, (counters.get(projectId) ?? 0) + 1);
				return counters.get(projectId)!;
			},
			lastPosition: async () => {
				const positions = table.all().map((t) => t.position);
				return positions.length ? Math.max(...positions) : null;
			}
		}
	});
	return { tasks, feed, activity, notifier, table, modules };
}

describe('tasks', () => {
	let ctx: ReturnType<typeof setup>;
	beforeEach(() => (ctx = setup()));
	const create = (title: string, extra = {}, actor = 'bastien') =>
		ctx.tasks.create({ id: testId(), projectId: 'p1', title, ...extra }, actor);

	it('numbers tasks per project and appends them at the end', async () => {
		const [first, second] = [await create('Un'), await create('Deux')];
		expect([first.number, second.number]).toEqual([1, 2]);
		expect(second.position).toBeGreaterThan(first.position);
	});

	it('keeps projects private to their team', async () => {
		await expect(create('X', {}, 'paul')).rejects.toThrow(/ne fais pas partie/);
		await expect(create('X', { assigneeId: 'paul' })).rejects.toThrow(/projet/);
	});

	it('tells the other person when a task is given to them, not when you take it', async () => {
		const task = await create('Relire', { assigneeId: 'ana' });
		expect(ctx.notifier.sent).toMatchObject([{ userId: 'ana', kind: 'assigned' }]);
		await ctx.tasks.update(task.id, { assigneeId: 'bastien' }, 'bastien');
		expect(ctx.notifier.sent).toHaveLength(1);
	});

	it('sends work in review to the other one of a two-person team', async () => {
		const task = await create('Coder la page', { assigneeId: 'bastien' });
		const reviewed = await ctx.tasks.update(task.id, { status: 'review' }, 'bastien');
		expect(reviewed.reviewerId).toBe('ana');
		expect(ctx.notifier.sent.at(-1)).toMatchObject({ userId: 'ana', kind: 'review' });
	});

	it('logs moves along the board and blockers, not every edit', async () => {
		const task = await create('Coder', {}, 'ana');
		await ctx.tasks.update(task.id, { title: 'Coder la page' }, 'ana');
		await ctx.tasks.update(task.id, { status: 'doing' }, 'ana');
		await ctx.tasks.update(task.id, { blockedReason: 'En attente du client' }, 'ana');
		await ctx.tasks.update(task.id, { status: 'done' }, 'ana');
		expect(ctx.activity.verbs).toEqual([
			'task.created',
			'task.started',
			'task.blocked',
			'task.done'
		]);
	});

	it('broadcasts deletions', async () => {
		const task = await create('Jeter');
		await ctx.tasks.delete(task.id, 'ana');
		expect(ctx.feed.removals).toEqual([task.id]);
	});

	it('only joins an open step of the same project', async () => {
		expect((await create('Maquettes', { milestoneId: 'm2' })).milestoneId).toBe('m2');
		await expect(create('X', { milestoneId: 'other' })).rejects.toThrow(/inconnue/);
		await expect(create('X', { milestoneId: 'm1' })).rejects.toThrow(/close/);
	});

	it('sends work reopened in a closed step to the step under way', async () => {
		const task = await create('Fini', { status: 'done' });
		ctx.table.put({ ...task, milestoneId: 'm1' });
		expect((await ctx.tasks.update(task.id, { status: 'todo' }, 'bastien')).milestoneId).toBe('m2');
	});

	it('puts a blocking bug in "Maintenant" and warns the whole team', async () => {
		const bug = await create('Le paiement plante', { kind: 'bug', critical: true });
		expect(bug).toMatchObject({ quadrant: 'now', critical: true });
		expect(ctx.notifier.sent).toMatchObject([{ userId: 'ana', kind: 'urgent' }]);
		expect(ctx.activity.verbs).toContain('bug.critical');
		const feature = await create('Export PDF', { kind: 'feature', critical: true });
		expect(feature.critical).toBe(false);
	});

	it('remembers when work started, once, and forgets the version of reopened work', async () => {
		const task = await create('Page horaires');
		const started = await ctx.tasks.update(task.id, { status: 'doing' }, 'bastien');
		expect(started.startedAt).not.toBeNull();
		ctx.table.put({ ...ctx.table.get(task.id)!, status: 'done', releaseId: 'v1' });
		const reopened = await ctx.tasks.update(task.id, { status: 'todo' }, 'bastien');
		expect(reopened).toMatchObject({ startedAt: started.startedAt, releaseId: null });
	});

	it('files a task only under a module of its project, still in use', async () => {
		const site = await ctx.tasks.createComponent(
			{ id: testId(), projectId: 'p1', name: 'Site' },
			'ana'
		);
		const other = await ctx.tasks.createComponent(
			{ id: testId(), projectId: 'p2', name: 'Autre' },
			'paul'
		);
		expect((await create('Footer', { componentId: site.id })).componentId).toBe(site.id);
		await expect(create('X', { componentId: other.id })).rejects.toThrow(/Module inconnu/);
		await expect(
			ctx.tasks.createComponent({ id: testId(), projectId: 'p1', name: 'site' }, 'ana')
		).rejects.toThrow(/existe déjà/);
		// A module that holds tasks is archived, not deleted.
		expect(await ctx.tasks.deleteComponent(site.id, 'ana')).toMatchObject({
			archivedAt: expect.any(String)
		});
		await expect(create('Y', { componentId: site.id })).rejects.toThrow(/archivé/);
	});
});
