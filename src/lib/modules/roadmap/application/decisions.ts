import { forbidden, invalid, notFound } from '../../kernel/domain/errors';
import {
	canWithdraw,
	validDecisionText,
	validWhy,
	type Decision,
	type DecisionSource
} from '../domain/decision';
import type { RoadmapDeps } from './ports';

export interface NewDecision {
	id: string;
	projectId: string;
	text: string;
	why?: string;
	messageId?: string | null;
	taskId?: string | null;
	milestoneId?: string | null;
	hypothesisId?: string | null;
	supersedes?: string | null;
}

/** Writes a decision and tells the team. Callers have checked access and links. */
export async function recordDecision(
	deps: RoadmapDeps,
	input: NewDecision,
	actorId: string,
	source: DecisionSource = 'manual'
) {
	const decision: Decision = {
		id: input.id,
		projectId: input.projectId,
		text: validDecisionText(input.text),
		why: validWhy(input.why ?? ''),
		messageId: input.messageId ?? null,
		taskId: input.taskId ?? null,
		milestoneId: input.milestoneId ?? null,
		hypothesisId: input.hypothesisId ?? null,
		supersedes: input.supersedes ?? null,
		source,
		decidedBy: actorId,
		decidedAt: deps.clock.now().toISOString()
	};
	await deps.decisions.put(decision);
	deps.decisionFeed.saved(decision);
	await deps.activity.record({
		actorId,
		verb: 'decision.made',
		subject: {
			kind: 'decision',
			id: decision.id,
			title: decision.text,
			projectId: decision.projectId
		}
	});
	return decision;
}

/** Everything a decision points at must belong to the same project. */
async function checkLinks(deps: RoadmapDeps, input: NewDecision, actorId: string) {
	const sameProject = (projectId: string | null | undefined) => {
		if (projectId !== input.projectId) throw invalid('Ce lien ne fait pas partie du projet.');
	};
	if (input.messageId) sameProject(await deps.messages.projectOf(input.messageId));
	if (input.taskId) sameProject((await deps.tasks.get(input.taskId, actorId)).projectId);
	if (input.milestoneId) sameProject((await deps.milestones.get(input.milestoneId))?.projectId);
	if (input.hypothesisId) sameProject((await deps.hypotheses.get(input.hypothesisId))?.projectId);
	if (input.supersedes) sameProject((await deps.decisions.get(input.supersedes))?.projectId);
}

export const createDecision =
	(deps: RoadmapDeps) => async (input: NewDecision, actorId: string) => {
		await deps.access.assertMember(input.projectId, actorId);
		await checkLinks(deps, input, actorId);
		return recordDecision(deps, input, actorId);
	};

/**
 * Only its author takes a decision back (by mistake, right after), and only one written by
 * hand: what the app wrote is the trace of a change. Otherwise, replace it.
 */
export const deleteDecision = (deps: RoadmapDeps) => async (id: string, actorId: string) => {
	const decision = await deps.decisions.get(id);
	if (!decision) throw notFound('Décision');
	await deps.access.assertMember(decision.projectId, actorId);
	if (decision.source !== 'manual')
		throw forbidden('Cette décision garde la trace d’un changement : remplace-la plutôt.');
	if (!canWithdraw(decision, actorId))
		throw forbidden('Seule la personne qui l’a notée peut retirer une décision. Remplace-la.');
	await deps.decisions.delete(id);
	deps.decisionFeed.removed(decision);
};
