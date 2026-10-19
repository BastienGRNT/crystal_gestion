import { ensure, requiredText } from '../../kernel/domain/errors';

export const VERDICTS = ['open', 'true', 'false'] as const;
export type Verdict = (typeof VERDICTS)[number];

/**
 * What the project bets on and has not checked yet ("les kinés paieront 29 €"). It takes the
 * place of a SWOT: a weakness worth knowing becomes something to verify, with a task.
 */
export interface Hypothesis {
	id: string;
	projectId: string;
	text: string;
	/** The task that checks it, once someone clicked "Vérifier". */
	taskId: string | null;
	verdict: Verdict;
	createdBy: string;
	createdAt: string;
}

/** More than that and nobody checks any of them. */
export const MAX_OPEN_HYPOTHESES = 3;

export const validHypothesisText = (text: string) => requiredText(text, 'L’hypothèse', 140);

export function ensureRoomFor(open: Hypothesis[]) {
	ensure(
		open.filter((h) => h.verdict === 'open').length < MAX_OPEN_HYPOTHESES,
		`${MAX_OPEN_HYPOTHESES} hypothèses à vérifier au plus : tranche d’abord celles qui sont ouvertes.`
	);
}

export const verificationTitle = (h: Pick<Hypothesis, 'text'>) => `Vérifier : ${h.text}`;

export const verdictDecision = (h: Pick<Hypothesis, 'text'>, verdict: 'true' | 'false') =>
	verdict === 'true' ? `Hypothèse confirmée : ${h.text}` : `Hypothèse fausse : ${h.text}`;
