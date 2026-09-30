import type { JournalEntry } from '$lib/modules/journal/domain/journal-entry';

export type DraftKind = 'decision' | 'fix';

/** Everything the inline composer edits before an entry exists. */
export interface JournalDraft {
	kind: DraftKind;
	title: string;
	featureId: string;
	rationale: string;
	decidedBy: string[];
	decidedOn: string | null;
	problem: string;
	cause: string;
	solution: string;
}

export const isDraftKind = (value: string | null): value is DraftKind =>
	value === 'decision' || value === 'fix';

export const emptyDraft = (kind: DraftKind, title: string, today: string, meId: string) => ({
	kind,
	title,
	featureId: '',
	rationale: '',
	decidedBy: [meId],
	decidedOn: today,
	problem: '',
	cause: '',
	solution: ''
});

export function toCreateInput(d: JournalDraft) {
	const details: JournalEntry['details'] =
		d.kind === 'decision'
			? { rationale: d.rationale.trim(), decidedBy: d.decidedBy, decidedOn: d.decidedOn }
			: { problem: d.problem.trim(), cause: d.cause.trim(), solution: d.solution.trim() };
	return { kind: d.kind, title: d.title.trim(), featureId: d.featureId || null, details };
}
