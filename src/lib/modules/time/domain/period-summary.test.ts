import { describe, expect, it } from 'vitest';
import { minutesWithin, summarize } from './period-summary';
import type { TimeEntry } from './time-entry';

const entry = (taskId: string, startedAt: string, endedAt: string | null): TimeEntry => ({
	...{ id: `${taskId}${startedAt}`, projectId: 'p', userId: 'u', taskId, startedAt, endedAt },
	source: 'manual'
});
const period = {
	from: new Date('2026-09-28T00:00:00Z'),
	to: new Date('2026-10-05T00:00:00Z'),
	now: new Date('2026-09-30T12:00:00Z')
};

describe('period summary', () => {
	it('only counts the part of a block inside the period', () => {
		const crossing = entry('a', '2026-09-27T23:00:00Z', '2026-09-28T01:00:00Z');
		expect(minutesWithin(crossing, period.from, period.to, period.now)).toBe(60);
	});

	it('counts a running timer up to now', () => {
		const running = entry('a', '2026-09-30T11:30:00Z', null);
		expect(minutesWithin(running, period.from, period.to, period.now)).toBe(30);
	});

	it('adds up time per key, biggest first, without empty keys', () => {
		const entries = [
			entry('a', '2026-09-29T10:00:00Z', '2026-09-29T11:00:00Z'),
			entry('b', '2026-09-29T12:00:00Z', '2026-09-29T14:00:00Z'),
			entry('a', '2026-09-30T10:00:00Z', '2026-09-30T10:30:00Z'),
			entry('c', '2026-10-10T10:00:00Z', '2026-10-10T11:00:00Z')
		];
		expect(summarize(entries, (e) => e.taskId, period)).toEqual([
			{ key: 'b', minutes: 120 },
			{ key: 'a', minutes: 90 }
		]);
	});
});
