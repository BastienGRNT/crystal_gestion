import { ensure, requiredText } from '../../kernel/domain/errors';

/**
 * Who wrote it: someone (`manual`), or the app when a date moved, work left a step at its
 * closing, a bet was settled, a step was deleted or an epic left the scope (`scope`); `ai`: proposed
 * by the project manager assistant and accepted by someone. Those are the trace of a change of scope:
 * nobody can take them back, or the change would become silent.
 */
export const DECISION_SOURCES = [
	'manual',
	'date',
	'carry',
	'verdict',
	'removal',
	'scope',
	'ai'
] as const;
export type DecisionSource = (typeof DECISION_SOURCES)[number];

/**
 * What the team settled, where it came from and why. Never rewritten to change its meaning:
 * a new decision replaces it (`supersedes`) and the old one stays visible, crossed out.
 */
export interface Decision {
	id: string;
	projectId: string;
	text: string;
	why: string;
	/** The message it was taken from: it carries a "Décision" badge in the discussion. */
	messageId: string | null;
	taskId: string | null;
	milestoneId: string | null;
	hypothesisId: string | null;
	supersedes: string | null;
	source: DecisionSource;
	decidedBy: string;
	decidedAt: string;
}

export const validDecisionText = (text: string) => requiredText(text, 'La décision', 280);

export function validWhy(text: string): string {
	ensure(text.length <= 500, 'Le pourquoi est trop long (500 caractères maximum).');
	return text.trim();
}

export const canWithdraw = (d: Pick<Decision, 'source' | 'decidedBy'>, userId: string) =>
	(d.source === 'manual' || d.source === 'ai') && d.decidedBy === userId;

/** The ids replaced by a newer decision. */
export const supersededIds = (decisions: Decision[]) =>
	new Set(decisions.map((d) => d.supersedes).filter((id): id is string => !!id));
