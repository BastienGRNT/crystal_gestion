import { describe, expect, it } from 'vitest';
import { dueState } from './deadline';
import { positionAt, positionBetween } from './position';
import { applyPatch, newTask, type Task } from './task';
import { boardOf, matrixOf } from './views';

const now = new Date('2026-10-13T10:00:00Z');
const task = (overrides: Partial<Task> = {}): Task => ({
	...newTask(
		{ id: 't1', projectId: 'p1', number: 1, title: 'Écrire', position: 0 },
		'bastien',
		now
	),
	...overrides
});

describe('task rules', () => {
	it('stamps the completion date when done and clears it when reopened', () => {
		const done = applyPatch(task(), { status: 'done' }, 'bastien', now);
		expect(done.completedAt).toBe(now.toISOString());
		expect(applyPatch(done, { status: 'todo' }, 'bastien', now).completedAt).toBeNull();
	});

	it('gives a task nobody holds to whoever starts it', () => {
		expect(applyPatch(task(), { status: 'doing' }, 'ana', now).assigneeId).toBe('ana');
		const held = task({ assigneeId: 'bastien' });
		expect(applyPatch(held, { status: 'doing' }, 'ana', now).assigneeId).toBe('bastien');
	});

	it('rejects an empty title', () => {
		expect(() => applyPatch(task(), { title: '  ' }, 'ana', now)).toThrow(/vide/);
		expect(() =>
			newTask({ id: 'x', projectId: 'p', number: 2, title: '', position: 0 }, 'a', now)
		).toThrow();
	});
});

describe('ordering', () => {
	it('places a card between its neighbours', () => {
		expect(positionBetween(1, 2)).toBe(1.5);
		expect(positionBetween(undefined, 1)).toBe(0);
		expect(positionBetween(3, undefined)).toBe(4);
		expect(positionAt([1, 2, 3], 0)).toBe(0);
		expect(positionAt([1, 2, 3], 3)).toBe(4);
	});
});

describe('deadlines', () => {
	it('flags late, today and the next two days', () => {
		expect(dueState('2026-10-12', '2026-10-13')).toBe('overdue');
		expect(dueState('2026-10-13', '2026-10-13')).toBe('today');
		expect(dueState('2026-10-15', '2026-10-13')).toBe('soon');
		expect(dueState('2026-10-20', '2026-10-13')).toBe('later');
		expect(dueState(null, '2026-10-13')).toBeNull();
	});
});

describe('views', () => {
	const tasks = [
		task({ id: 'a', quadrant: 'now', position: 2 }),
		task({ id: 'b', quadrant: 'now', position: 1, status: 'doing' }),
		task({ id: 'c', quadrant: null }),
		task({ id: 'd', quadrant: 'plan', status: 'done', completedAt: now.toISOString() }),
		task({ id: 'e', status: 'idea' }),
		task({ id: 'f', status: 'done', completedAt: '2026-09-01T10:00:00Z' })
	];

	it('puts active tasks in their box, unsorted ones in the inbox', () => {
		const matrix = matrixOf(tasks);
		expect(matrix.now.map((t) => t.id)).toEqual(['b', 'a']);
		expect(matrix.inbox.map((t) => t.id)).toEqual(['c']);
		expect(matrix.plan).toEqual([]);
	});

	it('keeps ideas off the board and hides old done tasks', () => {
		const board = boardOf(tasks, now);
		expect(board.columns.todo.map((t) => t.id)).toEqual(['c', 'a']);
		expect(board.columns.done.map((t) => t.id)).toEqual(['d']);
		expect(board.olderDone).toBe(1);
		expect(boardOf(tasks, now, true).columns.done).toHaveLength(2);
	});
});
