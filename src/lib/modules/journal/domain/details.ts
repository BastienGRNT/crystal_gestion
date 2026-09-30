import type { DecisionDetails, FixDetails, JournalDetails, ScopeDetails } from './journal-entry';

export const isScopeDetails = (details: JournalDetails): details is ScopeDetails =>
	'change' in details;

const editable = (details: JournalDetails) => (isScopeDetails(details) ? {} : details);

/** Decision fields with defaults, so partial or older entries always read the same way. */
export function decisionOf(details: JournalDetails): DecisionDetails {
	const d = editable(details);
	return {
		rationale: d.rationale ?? '',
		decidedBy: d.decidedBy ?? [],
		decidedOn: d.decidedOn ?? null
	};
}

export function fixOf(details: JournalDetails): FixDetails {
	const d = editable(details);
	return { problem: d.problem ?? '', cause: d.cause ?? '', solution: d.solution ?? '' };
}
