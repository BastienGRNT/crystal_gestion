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
import type { Task } from '../domain/task';
import { createTasks } from '../index';

function setup() {
	const table = new MemoryTable<Task>();
	const counters = new Map<string, number>();
	const feed = new RecordingFeed<Task>();
	const activity = new RecordingActivity();
	const notifier = new RecordingNotifier();
	const tasks = createTasks({
		clock: new FixedClock(),
		feed,
		activity,
		notifier,
		access: new FakeAccess({ p1: ['bastien', 'ana'] }),
		tasks: {
			ofProjects: async () => table.all(),
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
	return { tasks, feed, activity, notifier };
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
});
