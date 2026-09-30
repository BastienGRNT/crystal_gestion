import type { ScopeChange } from '$lib/modules/features/domain/scope';
import { decisionOf, fixOf, isScopeDetails } from '$lib/modules/journal/domain/details';
import type {
	FixDetails,
	JournalEntry,
	JournalKind
} from '$lib/modules/journal/domain/journal-entry';
import { isDraft } from '../live/optimistic';
import {
	featureTag,
	people,
	person,
	type FeatureTagView,
	type PersonView,
	type ViewSources
} from './element-view';

export type JournalBody =
	| { kind: 'decision'; rationale: string; decidedBy: PersonView[]; decidedOn: string | null }
	| ({ kind: 'fix' } & FixDetails)
	| { kind: 'scope'; change: ScopeChange | null; featureTitle: string };

export interface JournalEntryView {
	id: string;
	ref: string;
	kind: JournalKind;
	title: string;
	createdAt: string;
	draft: boolean;
	feature: FeatureTagView | null;
	author: PersonView | null;
	body: JournalBody;
}

export function journalBody(entry: JournalEntry, s: ViewSources): JournalBody {
	if (entry.kind === 'fix') return { kind: 'fix', ...fixOf(entry.details) };
	if (entry.kind === 'scope') {
		const scope = isScopeDetails(entry.details) ? entry.details : null;
		return { kind: 'scope', change: scope, featureTitle: scope?.featureTitle ?? entry.title };
	}
	const decision = decisionOf(entry.details);
	return { kind: 'decision', ...decision, decidedBy: people(decision.decidedBy, s) };
}

export const toJournalView = (entry: JournalEntry, s: ViewSources): JournalEntryView => ({
	id: entry.id,
	ref: entry.ref,
	kind: entry.kind,
	title: entry.title,
	createdAt: entry.createdAt,
	draft: isDraft(entry.id),
	feature: featureTag(entry.featureId, s),
	author: person(entry.createdBy, s),
	body: journalBody(entry, s)
});
