import { beforeEach, describe, expect, it } from 'vitest';
import {
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
		directory: {
			projectExists: async (id) => id === 'p1',
			userExists: async (id) => ['bastien', 'ana'].includes(id)
		},
		tasks: {
			list: async () => table.all(),
			get: async (id) => table.get(id),
			insert: async (task) => table.put(task),
			save: async (task) => table.put(task),
			delete: async (id) => table.delete(id),
			nextNumber: async (projectId) => {
				counters.set(projectId, (counters.get(projectId) ?? 0) + 1);
				return counters.get(projectId)!;
			},
			lastPosition: async (projectId) => {
				const positions = table
					.all()
					.filter((t) => t.projectId === projectId)
					.map((t) => t.position);
				return positions.length ? Math.max(...positions) : null;
			}
		}
	});
	return { tasks, feed, activity, notifier };
}

describe('tasks', () => {
	let ctx: ReturnType<typeof setup>;
	beforeEach(() => (ctx = setup()));

	it('numbers tasks per project and appends them at the end', async () => {
		const first = await ctx.tasks.create({ id: testId(), projectId: 'p1', title: 'Un' }, 'bastien');
		const second = await ctx.tasks.create(
			{ id: testId(), projectId: 'p1', title: 'Deux' },
			'bastien'
		);
		expect([first.number, second.number]).toEqual([1, 2]);
		expect(second.position).toBeGreaterThan(first.position);
		expect(ctx.feed.saves).toHaveLength(2);
	});

	it('refuses an unknown project or assignee', async () => {
		await expect(
			ctx.tasks.create({ id: testId(), projectId: 'nope', title: 'X' }, 'bastien')
		).rejects.toThrow(/Projet introuvable/);
		await expect(
			ctx.tasks.create({ id: testId(), projectId: 'p1', title: 'X', assigneeId: 'paul' }, 'bastien')
		).rejects.toThrow(/équipe/);
	});

	it('tells the other person when a task is given to them, not when you take it', async () => {
		const task = await ctx.tasks.create(
			{ id: testId(), projectId: 'p1', title: 'Relire', assigneeId: 'ana' },
			'bastien'
		);
		expect(ctx.notifier.sent).toMatchObject([{ userId: 'ana', kind: 'assigned' }]);
		await ctx.tasks.update(task.id, { assigneeId: 'bastien' }, 'bastien');
		expect(ctx.notifier.sent).toHaveLength(1);
	});

	it('logs starting and finishing, not every edit', async () => {
		const task = await ctx.tasks.create({ id: testId(), projectId: 'p1', title: 'Coder' }, 'ana');
		await ctx.tasks.update(task.id, { title: 'Coder la page' }, 'ana');
		await ctx.tasks.update(task.id, { status: 'doing' }, 'ana');
		await ctx.tasks.update(task.id, { status: 'done' }, 'ana');
		expect(ctx.activity.verbs).toEqual(['task.created', 'task.started', 'task.done']);
	});

	it('broadcasts deletions', async () => {
		const task = await ctx.tasks.create({ id: testId(), projectId: 'p1', title: 'Jeter' }, 'ana');
		await ctx.tasks.delete(task.id);
		expect(ctx.feed.removals).toEqual([task.id]);
		await expect(ctx.tasks.update(task.id, { title: 'x' }, 'ana')).rejects.toThrow(/introuvable/);
	});
});
