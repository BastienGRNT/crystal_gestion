import { toDateKey } from '$lib/modules/kernel/domain/dates';
import {
	textsOf,
	type JournalEntry,
	type JournalKind
} from '$lib/modules/journal/domain/journal-entry';

export interface JournalFilter {
	kind: JournalKind | 'all';
	/** Empty string = every feature. */
	featureId: string;
	query: string;
}

export const NO_FILTER: JournalFilter = { kind: 'all', featureId: '', query: '' };

const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function matchesJournal(entry: JournalEntry, filter: JournalFilter): boolean {
	if (filter.kind !== 'all' && entry.kind !== filter.kind) return false;
	if (filter.featureId && entry.featureId !== filter.featureId) return false;
	const query = normalize(filter.query.trim());
	const haystack = normalize([entry.ref, entry.title, ...textsOf(entry)].join(' '));
	return !query || haystack.includes(query);
}

export interface DayGroup<T> {
	day: string;
	items: T[];
}

/** Newest first, bucketed by local calendar day. */
export function groupByDay<T extends { createdAt: string }>(items: T[]): DayGroup<T>[] {
	const groups = new Map<string, T[]>();
	const sorted = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
	for (const item of sorted) {
		const day = toDateKey(new Date(item.createdAt));
		groups.set(day, [...(groups.get(day) ?? []), item]);
	}
	return [...groups].map(([day, grouped]) => ({ day, items: grouped }));
}
