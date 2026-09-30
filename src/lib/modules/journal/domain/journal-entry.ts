import type { ElementBase } from '$lib/modules/kernel/domain/element';
import type { ScopeChange } from '$lib/modules/features/domain/scope';

export const JOURNAL_KINDS = ['decision', 'fix', 'scope'] as const;
export type JournalKind = (typeof JOURNAL_KINDS)[number];

export const JOURNAL_LABELS: Record<JournalKind, string> = {
	decision: 'Décision',
	fix: 'Bug résolu',
	scope: 'Changement de périmètre'
};

export interface DecisionDetails {
	rationale: string;
	decidedBy: string[];
	decidedOn: string | null;
}

export interface FixDetails {
	problem: string;
	cause: string;
	solution: string;
}

export type ScopeDetails = ScopeChange & { featureTitle: string };

export type JournalDetails = Partial<DecisionDetails & FixDetails> | ScopeDetails;

export interface JournalFields {
	kind: JournalKind;
	title: string;
	featureId: string | null;
	details: JournalDetails;
}

export interface JournalEntry extends ElementBase, JournalFields {
	kind: JournalKind;
	projectId: string;
	createdBy: string | null;
	createdAt: string;
}

export function asJournalKind(kind: string): JournalKind {
	const found = JOURNAL_KINDS.find((candidate) => candidate === kind);
	if (!found) throw new Error(`Not a journal kind: ${kind}`);
	return found;
}

export const textsOf = (entry: Pick<JournalEntry, 'details'>) =>
	Object.values(entry.details).filter((value): value is string => typeof value === 'string');
