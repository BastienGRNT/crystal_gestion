import { describe, expect, it } from 'vitest';
import type { TimeEntry } from '$lib/modules/time/domain/time-entry';
import { entriesIn, ranked, weekPeriod, weeklyTotals } from './history';

const now = new Date(2026, 8, 30, 12);
const entry = (id: string, start: Date, minutes: number | null): TimeEntry => ({
	id,
	projectId: 'p',
	userId: 'u',
	taskId: null,
	source: 'manual',
	startedAt: start.toISOString(),
	endedAt: minutes === null ? null : new Date(start.getTime() + minutes * 60_000).toISOString()
});

describe('history', () => {
	const entries = [
		entry('a', new Date(2026, 8, 29, 10), 60),
		entry('b', new Date(2026, 8, 22, 10), 30),
		entry('c', new Date(2026, 8, 30, 11), null)
	];

	it('builds week periods backwards from now', () => {
		expect(weekPeriod(now, 0).from).toEqual(new Date(2026, 8, 28));
		expect(weekPeriod(now, 1).to).toEqual(new Date(2026, 8, 28));
	});

	it('attributes entries to the week they started in, running ones included', () => {
		expect(entriesIn(entries, weekPeriod(now, 0)).map((e) => e.id)).toEqual(['a', 'c']);
		expect(weeklyTotals(entries, now, 0, 2).map((w) => w.minutes)).toEqual([30, 120]);
	});

	it('ranks totals from the largest and drops empty ones', () => {
		const totals = new Map([
			['x', 10],
			['y', 0],
			['z', 40]
		]);
		expect(ranked(totals)).toEqual([
			{ key: 'z', minutes: 40 },
			{ key: 'x', minutes: 10 }
		]);
	});
});
