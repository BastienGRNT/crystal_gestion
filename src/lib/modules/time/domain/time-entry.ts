import { invalid } from '$lib/modules/kernel/domain/errors';

export type TimeSource = 'timer' | 'manual';

/** A timer session or a block drawn on the planning: `endedAt === null` means the timer is running. */
export interface TimeEntry {
	id: string;
	projectId: string;
	userId: string;
	taskId: string | null;
	startedAt: string;
	endedAt: string | null;
	source: TimeSource;
}

export const isRunning = (entry: TimeEntry) => entry.endedAt === null;

export const durationMinutes = (entry: TimeEntry, now: Date) =>
	Math.max(
		0,
		Math.round(
			((entry.endedAt ? Date.parse(entry.endedAt) : now.getTime()) - Date.parse(entry.startedAt)) /
				60_000
		)
	);

export function assertValidRange(startedAt: string, endedAt: string) {
	if (Date.parse(endedAt) <= Date.parse(startedAt))
		throw invalid('La fin doit être après le début');
}

export function totalMinutes(entries: TimeEntry[], now: Date) {
	return entries.reduce((sum, entry) => sum + durationMinutes(entry, now), 0);
}

export function minutesBy<K>(
	entries: TimeEntry[],
	keyOf: (entry: TimeEntry) => K,
	now: Date
): Map<K, number> {
	const totals = new Map<K, number>();
	for (const entry of entries)
		totals.set(keyOf(entry), (totals.get(keyOf(entry)) ?? 0) + durationMinutes(entry, now));
	return totals;
}

export function formatMinutes(minutes: number): string {
	const hours = Math.floor(minutes / 60);
	const rest = minutes % 60;
	if (!hours) return `${rest} min`;
	return rest ? `${hours} h ${String(rest).padStart(2, '0')}` : `${hours} h`;
}
