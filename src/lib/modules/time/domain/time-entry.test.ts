import { describe, expect, it } from 'vitest';
import { durationMinutes, formatMinutes, minutesBy, type TimeEntry } from './time-entry';

const entry = (
	startedAt: string,
	endedAt: string | null,
	taskId: string | null = 't'
): TimeEntry => ({
	id: startedAt,
	projectId: 'p',
	userId: 'u',
	taskId,
	startedAt,
	endedAt,
	source: 'timer'
});
const now = new Date('2026-09-30T12:00:00Z');

describe('time entries', () => {
	it('measures closed and running entries', () => {
		expect(durationMinutes(entry('2026-09-30T10:00:00Z', '2026-09-30T10:45:00Z'), now)).toBe(45);
		expect(durationMinutes(entry('2026-09-30T11:30:00Z', null), now)).toBe(30);
	});

	it('sums minutes by key', () => {
		const totals = minutesBy(
			[
				entry('2026-09-30T10:00:00Z', '2026-09-30T11:00:00Z'),
				entry('2026-09-30T11:00:00Z', null, null)
			],
			(e) => e.taskId,
			now
		);
		expect(totals.get('t')).toBe(60);
		expect(totals.get(null)).toBe(60);
	});

	it('formats durations', () => {
		expect(formatMinutes(45)).toBe('45 min');
		expect(formatMinutes(125)).toBe('2 h 05');
		expect(formatMinutes(120)).toBe('2 h');
	});
});
