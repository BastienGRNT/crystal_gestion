import { describe, expect, it, vi } from 'vitest';
import type { Task } from '../domain/task';
import { makeMoveTask } from './move-task';
import { makeStartTask } from './timer-actions';

const task: Task = {
	id: 't1',
	ref: 'T-1',
	kind: 'task',
	projectId: 'p',
	title: 'Écrire',
	description: '',
	featureId: null,
	dueDate: null,
	important: null,
	assigneeIds: [],
	status: 'todo',
	position: 1,
	completedAt: null,
	createdAt: '2026-09-01T00:00:00Z',
	updatedAt: '2026-09-01T00:00:00Z'
};
const actor = { id: 'u', name: 'U' };
const now = new Date('2026-09-30T12:00:00Z');

const setup = () => {
	const deps = {
		tasks: {
			find: vi.fn(async () => task),
			update: vi.fn(async (_p: string, _i: string, changes: Partial<Task>) => ({
				...task,
				...changes
			})),
			positions: vi.fn(async () => [5]),
			create: vi.fn(),
			list: vi.fn(),
			delete: vi.fn()
		},
		timer: { start: vi.fn(), stopForUser: vi.fn(), stopForTask: vi.fn() },
		feed: { upserted: vi.fn(), deleted: vi.fn() },
		activity: { record: vi.fn() },
		notifier: { notify: vi.fn() },
		references: { sync: vi.fn() },
		clock: { now: () => now }
	};
	return { deps, move: makeMoveTask(deps) };
};

describe('move task', () => {
	it('completing a task stamps it, stops its timers and logs completion', async () => {
		const { deps, move } = setup();
		const done = await move(actor, { projectId: 'p', id: 't1', status: 'done' });
		expect(done.completedAt).toBe(now.toISOString());
		expect(done.position).toBeGreaterThan(5);
		expect(deps.timer.stopForTask).toHaveBeenCalledWith('t1');
		expect(deps.activity.record).toHaveBeenCalledWith(
			expect.objectContaining({ verb: 'completed' })
		);
	});

	it('reordering inside a column logs nothing', async () => {
		const { deps, move } = setup();
		await move(actor, { projectId: 'p', id: 't1', status: 'todo', position: 3 });
		expect(deps.activity.record).not.toHaveBeenCalled();
	});

	it('starting a task moves it in progress and starts the timer', async () => {
		const { deps, move } = setup();
		await makeStartTask(deps, move)(actor, { projectId: 'p', id: 't1' });
		expect(deps.tasks.update).toHaveBeenCalledWith(
			'p',
			't1',
			expect.objectContaining({ status: 'in_progress' })
		);
		expect(deps.timer.start).toHaveBeenCalledWith('p', 'u', 't1');
	});
});
