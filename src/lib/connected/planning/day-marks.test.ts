import { describe, expect, it } from 'vitest';
import type { Task } from '$lib/modules/tasks/domain/task';
import { dayMarks } from './day-marks';

const task = (id: string, changes: Partial<Task>): Task => ({
	...{ id, ref: id.toUpperCase(), kind: 'task', projectId: 'p', title: id, description: '' },
	...{ featureId: null, dueDate: null, important: null, urgent: null, assigneeIds: ['ana'] },
	...{ isFix: false, status: 'todo', position: 0, completedAt: null },
	...{ createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z' },
	...changes
});
const ana = { id: 'ana', name: 'Ana', color: '#e55' };
const days = [new Date(2026, 8, 30), new Date(2026, 9, 1)];
const sources = (tasks: Task[]) => ({
	tasks,
	people: [ana],
	colorOf: () => 'var(--feature-0)',
	today: new Date(2026, 9, 1, 12)
});

describe('dayMarks', () => {
	it('puts open tasks on their due day, late when the day is past', () => {
		const marks = dayMarks(days, sources([task('t1', { dueDate: '2026-09-30' })]));
		expect(marks[0]).toMatchObject([{ kind: 'due', ref: 'T1', late: true }]);
		expect(marks[1]).toEqual([]);
	});

	it('shows finished tasks on the day they were finished, with who did them', () => {
		const done = task('t2', {
			status: 'done',
			dueDate: '2026-09-30',
			completedAt: new Date(2026, 9, 1, 15).toISOString()
		});
		const marks = dayMarks(days, sources([done]));
		expect(marks[0]).toEqual([]);
		expect(marks[1]).toMatchObject([{ kind: 'done', ref: 'T2', person: ana }]);
	});

	it('ignores tasks of people not shown and icebox tasks', () => {
		const tasks = [
			task('t3', { dueDate: '2026-10-01', assigneeIds: ['leo'] }),
			task('t4', { dueDate: '2026-10-01', status: 'icebox' })
		];
		expect(dayMarks(days, sources(tasks))[1]).toEqual([]);
	});
});
