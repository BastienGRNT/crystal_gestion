import { forbidden, invalid } from '../../kernel/domain/errors';
import { toDateKey } from '../../kernel/domain/dates';
import { ACTIONS, type ActionKey } from '../domain/actions';
import { buildContext, fingerprint, targetText } from '../domain/context';
import { costMicros, modelId } from '../domain/pricing';
import { cleanProposal, type Proposal } from '../domain/proposal';
import { requestText, SYSTEM_PROMPT } from '../domain/prompt';
import type { AssistantDeps } from './ports';

export interface AskInput {
	projectId: string;
	action: ActionKey;
	targetId: string | null;
	/** The team's answers to the questions of the first round. */
	answers: { question: string; answer: string }[];
	/** The one revision: the proposal to correct and what to change. */
	previous: Proposal | null;
	remark: string | null;
}

export interface AskResult {
	proposal: Proposal;
	/** Served from the cache: nothing changed, nothing paid. */
	cached: boolean;
	costMicros: number;
	month: { requests: number; micros: number };
}

const CACHE_DAYS = 7;
const startOfMonth = (now: Date) => new Date(now.getFullYear(), now.getMonth(), 1);

const previousText = (p: Proposal) =>
	JSON.stringify({
		summary: p.summary,
		ops: p.ops.map((o) => ({ command: o.command, ref: o.ref, input: o.input, reason: o.reason }))
	});

/**
 * One ask to the assistant, always after a click: check access and the month's quota, build
 * the context (the cache answers the same question for free), call the model once, keep what
 * the white list allows, write down what it cost.
 */
export const ask = (deps: AssistantDeps) => async (input: AskInput, actorId: string) => {
	await deps.access.assertMember(input.projectId, actorId);
	if (!deps.llm.configured())
		throw invalid(
			'Le chef de projet IA n’est pas configuré sur ce serveur (clé ANTHROPIC_API_KEY).'
		);
	const spec = ACTIONS[input.action];
	if (spec.target !== 'project' && !input.targetId) throw invalid('Il manque l’élément visé.');
	if (input.remark !== null && !input.previous) throw invalid('Rien à corriger.');

	const now = deps.clock.now();
	const [month] = await deps.usage.since([input.projectId], startOfMonth(now));
	const used = month ?? { requests: 0, micros: 0 };
	if (used.requests >= deps.quota.requests || used.micros >= deps.quota.micros)
		throw forbidden(
			'Le budget du mois de l’assistant est atteint pour ce projet. Il revient le 1er du mois.'
		);

	const data = await deps.reader.read(
		input.projectId,
		{ kind: spec.target, id: input.targetId },
		actorId
	);
	const context = buildContext(data, spec.contextBudget, {
		withTasks: 'withTasks' in spec && spec.withTasks,
		now
	});
	const target = targetText(spec.target, input.targetId, data, context.aliases);
	if (spec.target !== 'project' && !target) throw invalid('Élément visé introuvable.');
	const request = requestText({
		instruction: spec.instruction,
		allowed: spec.ops,
		target,
		answers: input.answers,
		previous: input.previous ? previousText(input.previous) : null,
		remark: input.remark?.trim() || null
	});

	const key = fingerprint(
		modelId(deps.llm.billing, spec.size),
		SYSTEM_PROMPT,
		context.text,
		request
	);
	const since = new Date(now.getTime() - CACHE_DAYS * 86_400_000);
	const cached = await deps.usage.cached(key, since);
	if (cached)
		return { proposal: cached, cached: true, costMicros: 0, month: used } satisfies AskResult;

	const answer = await deps.llm.propose({
		size: spec.size,
		system: SYSTEM_PROMPT,
		context: `Contexte du projet au ${toDateKey(now)} :\n\n${context.text}`,
		request,
		maxTokens: spec.maxTokens
	});
	const proposal = cleanProposal(answer.raw, {
		allowed: spec.ops,
		aliases: context.aliases,
		newId: deps.newId
	});
	// Once the team answered, the next round must be a proposal, not more questions.
	if (input.answers.length || input.previous) proposal.questions = [];
	const cost = costMicros(deps.llm.billing, spec.size, answer.usage);
	await deps.usage.insert({
		id: deps.newId(),
		projectId: input.projectId,
		userId: actorId,
		action: input.action,
		model: answer.model,
		fingerprint: key,
		usage: answer.usage,
		costMicros: cost,
		proposal,
		createdAt: now.toISOString()
	});
	return {
		proposal,
		cached: false,
		costMicros: cost,
		month: { requests: used.requests + 1, micros: used.micros + cost }
	} satisfies AskResult;
};

/** What the assistant cost this month, per project, for the account page. */
export const monthUsage = (deps: AssistantDeps) => (projectIds: string[]) =>
	deps.usage.since(projectIds, startOfMonth(deps.clock.now()));
