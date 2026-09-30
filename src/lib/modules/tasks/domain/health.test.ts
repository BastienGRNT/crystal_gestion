import { describe, expect, it } from 'vitest';
import { isLate, isStale } from './health';
import type { Task } from './task';

const base: Task = {
	id: 't',
	ref: 'T-1',
	kind: 'task',
	projectId: 'p',
	title: 't',
	description: '',
	featureId: null,
	dueDate: null,
	important: null,
	assigneeIds: [],
	status: 'in_progress',
	position: 1,
	completedAt: null,
	createdAt: '2026-09-01T00:00:00Z',
	updatedAt: '2026-09-01T00:00:00Z'
};
const now = new Date(2026, 8, 30);

describe('task health', () => {
	it('flags overdue unfinished tasks as late', () => {
		expect(isLate({ ...base, dueDate: '2026-09-29' }, now)).toBe(true);
		expect(isLate({ ...base, dueDate: '2026-09-29', status: 'done' }, now)).toBe(false);
	});

	it('flags started tasks untouched for a week as stale', () => {
		expect(isStale(base, now)).toBe(true);
		expect(isStale({ ...base, status: 'todo' }, now)).toBe(false);
		expect(isStale({ ...base, updatedAt: '2026-09-28T00:00:00Z' }, now)).toBe(false);
	});
});
