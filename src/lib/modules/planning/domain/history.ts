import { durationMinutes, type TimeEntry } from '$lib/modules/time/domain/time-entry';
import { addDays, startOfWeek } from './calendar';

export interface Period {
	from: Date;
	to: Date;
}

/** The week `offset` weeks before the one containing `now` (0 = this week). */
export function weekPeriod(now: Date, offset: number): Period {
	const from = addDays(startOfWeek(now), -7 * offset);
	return { from, to: addDays(from, 7) };
}

export const inPeriod = (iso: string | null, { from, to }: Period) => {
	if (!iso) return false;
	const at = Date.parse(iso);
	return at >= from.getTime() && at < to.getTime();
};

/** Time entries are attributed to the week they started in. */
export const entriesIn = (entries: TimeEntry[], period: Period) =>
	entries.filter((entry) => inPeriod(entry.startedAt, period));

/** Minutes worked in each of the `count` weeks ending with the one `offset` weeks ago, oldest first. */
export function weeklyTotals(entries: TimeEntry[], now: Date, offset: number, count: number) {
	return Array.from({ length: count }, (_, index) => {
		const period = weekPeriod(now, offset + count - 1 - index);
		const minutes = entriesIn(entries, period).reduce(
			(sum, entry) => sum + durationMinutes(entry, now),
			0
		);
		return { from: period.from, minutes };
	});
}

/** Map totals sorted from the largest, ready to draw as bars. */
export const ranked = <K>(totals: Map<K, number>) =>
	[...totals.entries()]
		.filter(([, minutes]) => minutes > 0)
		.sort((a, b) => b[1] - a[1])
		.map(([key, minutes]) => ({ key, minutes }));
