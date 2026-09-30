import { describe, expect, it } from 'vitest';
import type { JournalEntry } from '$lib/modules/journal/domain/journal-entry';
import { groupByDay, matchesJournal, NO_FILTER } from './journal-timeline';

const entry = (overrides: Partial<JournalEntry>): JournalEntry => ({
	id: 'e',
	ref: 'D-1',
	kind: 'decision',
	title: 'Stripe Checkout',
	projectId: 'p',
	featureId: 'f1',
	details: { rationale: 'Conformité SCA gérée' },
	createdBy: null,
	createdAt: new Date(2026, 8, 30, 10).toISOString(),
	...overrides
});

describe('matchesJournal', () => {
	it('filters by kind, feature and accent-insensitive text in any field', () => {
		const decision = entry({});
		expect(matchesJournal(decision, NO_FILTER)).toBe(true);
		expect(matchesJournal(decision, { ...NO_FILTER, kind: 'fix' })).toBe(false);
		expect(matchesJournal(decision, { ...NO_FILTER, featureId: 'f2' })).toBe(false);
		expect(matchesJournal(decision, { ...NO_FILTER, query: 'conformite' })).toBe(true);
		expect(matchesJournal(decision, { ...NO_FILTER, query: 'd-1' })).toBe(true);
		expect(matchesJournal(decision, { ...NO_FILTER, query: 'paypal' })).toBe(false);
	});
});

describe('groupByDay', () => {
	it('groups entries per local day, newest first', () => {
		const at = (day: number, hour: number) => new Date(2026, 8, day, hour).toISOString();
		const groups = groupByDay([
			entry({ id: 'a', createdAt: at(28, 9) }),
			entry({ id: 'b', createdAt: at(30, 8) }),
			entry({ id: 'c', createdAt: at(30, 18) })
		]);
		expect(groups.map((g) => g.day)).toEqual(['2026-09-30', '2026-09-28']);
		expect(groups[0].items.map((e) => e.id)).toEqual(['c', 'b']);
	});
});
