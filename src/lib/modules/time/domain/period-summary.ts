import type { TimeEntry } from './time-entry';

/** Minutes of an entry inside [from, to): a block crossing the edge of the period only counts its inside part. */
export function minutesWithin(entry: TimeEntry, from: Date, to: Date, now: Date) {
	const start = Math.max(Date.parse(entry.startedAt), from.getTime());
	const end = Math.min(entry.endedAt ? Date.parse(entry.endedAt) : now.getTime(), to.getTime());
	return Math.max(0, Math.round((end - start) / 60_000));
}

/** Time spent per key (feature, person…) over a period, biggest first, empty keys left out. */
export function summarize<K>(
	entries: TimeEntry[],
	keyOf: (entry: TimeEntry) => K,
	period: { from: Date; to: Date; now: Date }
): { key: K; minutes: number }[] {
	const totals = new Map<K, number>();
	for (const entry of entries) {
		const minutes = minutesWithin(entry, period.from, period.to, period.now);
		if (minutes) totals.set(keyOf(entry), (totals.get(keyOf(entry)) ?? 0) + minutes);
	}
	return [...totals]
		.map(([key, minutes]) => ({ key, minutes }))
		.sort((a, b) => b.minutes - a.minutes);
}
