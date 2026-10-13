import { describe, expect, it } from 'vitest';
import type { AvailabilitySlot } from '$lib/modules/planning/domain/availability';
import { newTask, type Task } from '$lib/modules/tasks/domain/task';
import { deadlineRisk, deliveryForecast } from './forecast';

const now = new Date(2026, 9, 13, 10);
const today = '2026-10-13';
const task = (patch: Partial<Task>): Task => ({
	...newTask({ id: 't', projectId: 'p', number: 1, title: 'Paiement', position: 1 }, 'me', now),
	...patch
});
const slot = (userId: string, day: number, from: number, to: number): AvailabilitySlot => ({
	id: `${userId}-${day}-${from}`,
	userId,
	startsAt: new Date(2026, 9, day, from).toISOString(),
	endsAt: new Date(2026, 9, day, to).toISOString(),
	status: 'available'
});
const ctx = (slots: AvailabilitySlot[], waitingOn: string[] = []) => ({
	today,
	now,
	slots,
	waitingOn,
	meId: 'me',
	nameOf: (id: string) => (id === 'cam' ? 'Camille' : id)
});

describe('will the deadline hold', () => {
	it('crosses it with the planning, the questions and the board', () => {
		const thursday = task({ dueDate: '2026-10-15', assigneeId: 'cam', status: 'doing' });
		// Camille fills in her planning, but has nothing before Thursday evening.
		const later = [slot('cam', 20, 14, 18)];
		expect(deadlineRisk(thursday, ctx(later))?.text).toBe('Camille n’a pas de dispo d’ici là');
		expect(deadlineRisk(thursday, ctx([...later, slot('cam', 14, 14, 18)]))).toBeNull();
		expect(deadlineRisk(thursday, ctx([], ['cam']))?.text).toBe('Attend la réponse de Camille');
		expect(deadlineRisk({ ...thursday, assigneeId: null }, ctx([]))?.text).toBe('Personne dessus');
		expect(deadlineRisk({ ...thursday, status: 'todo' }, ctx([]))?.text).toBe(
			'Pas encore commencée'
		);
	});

	it('forecasts the delivery from the pace of the last four weeks', () => {
		const done = (day: number) =>
			task({ status: 'done', completedAt: new Date(2026, 9, day).toISOString() });
		const tasks = [done(1), done(5), done(8), done(12), ...Array(6).fill(task({}))];
		// One task a week: two weeks left hold two of the six open tasks.
		expect(deliveryForecast(tasks, '2026-10-27', today, now)).toMatchObject({
			open: 6,
			fits: false,
			excess: 4
		});
		expect(deliveryForecast(tasks.slice(2), '2026-10-27', today, now)).toBeNull();
	});
});
