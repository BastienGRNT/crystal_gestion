import { describe, expect, it } from 'vitest';
import type { AvailabilitySlot } from '$lib/modules/planning/domain/availability';
import { newTask } from '$lib/modules/tasks/domain/task';
import { agendaOf, nextMoment } from './sync-point';

const now = new Date(2026, 9, 13, 10);
const slot = (userId: string, day: number, from: number, to: number, status = 'available') =>
	({
		id: `${userId}-${day}-${from}`,
		userId,
		startsAt: new Date(2026, 9, day, from).toISOString(),
		endsAt: new Date(2026, 9, day, to).toISOString(),
		status
	}) as AvailabilitySlot;

describe('the next point together', () => {
	it('finds the first moment both are surely there, a "peut-être" does not count', () => {
		const moment = nextMoment(
			[
				slot('me', 13, 19, 23),
				slot('cam', 13, 20, 22, 'maybe'),
				slot('cam', 14, 14, 18),
				slot('me', 14, 16, 20)
			],
			'me',
			['cam'],
			now
		);
		expect(moment).toMatchObject({
			start: new Date(2026, 9, 14, 16),
			end: new Date(2026, 9, 14, 18),
			with: ['cam'],
			ongoing: false
		});
	});

	it('lists each task once, for its most pressing reason', () => {
		const task = newTask(
			{ id: 't', projectId: 'p', number: 1, title: 'X', position: 1 },
			'me',
			now
		);
		const items = agendaOf({
			tasks: [
				{ ...task, status: 'review', blockedReason: 'Client' },
				{ ...task, id: 'u' }
			],
			questions: [],
			risks: new Map([['t', { tone: 'danger', text: 'Bloquée : Client' }]]),
			now
		});
		expect(items.map((i) => i.kind)).toEqual(['review', 'sort']);
	});
});
