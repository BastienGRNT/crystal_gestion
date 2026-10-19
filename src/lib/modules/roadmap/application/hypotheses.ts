import { conflict, ensure, notFound } from '../../kernel/domain/errors';
import { currentMilestone } from '../domain/milestone';
import {
	ensureRoomFor,
	validHypothesisText,
	verdictDecision,
	verificationTitle,
	type Hypothesis
} from '../domain/hypothesis';
import { readingId, validMetricValue, validWeekOf, type MetricReading } from '../domain/metric';
import { recordDecision } from './decisions';
import type { RoadmapDeps } from './ports';

async function existing(deps: RoadmapDeps, id: string, actorId: string) {
	const hypothesis = await deps.hypotheses.get(id);
	if (!hypothesis) throw notFound('Hypothèse');
	await deps.access.assertMember(hypothesis.projectId, actorId);
	return hypothesis;
}

async function save(deps: RoadmapDeps, hypothesis: Hypothesis) {
	await deps.hypotheses.put(hypothesis);
	deps.hypothesisFeed.saved(hypothesis);
	return hypothesis;
}

export const createHypothesis =
	(deps: RoadmapDeps) =>
	async (input: { id: string; projectId: string; text: string }, actorId: string) => {
		await deps.access.assertMember(input.projectId, actorId);
		ensureRoomFor(await deps.hypotheses.ofProject(input.projectId));
		return save(deps, {
			id: input.id,
			projectId: input.projectId,
			text: validHypothesisText(input.text),
			taskId: null,
			verdict: 'open',
			createdBy: actorId,
			createdAt: deps.clock.now().toISOString()
		});
	};

export const updateHypothesis =
	(deps: RoadmapDeps) => async (id: string, text: string, actorId: string) => {
		const hypothesis = await existing(deps, id, actorId);
		return save(deps, { ...hypothesis, text: validHypothesisText(text) });
	};

export const deleteHypothesis = (deps: RoadmapDeps) => async (id: string, actorId: string) => {
	const hypothesis = await existing(deps, id, actorId);
	await deps.hypotheses.delete(id);
	deps.hypothesisFeed.removed(hypothesis);
};

/** Turns the bet into work: a task in the step under way. */
export const verifyHypothesis = (deps: RoadmapDeps) => async (id: string, actorId: string) => {
	const hypothesis = await existing(deps, id, actorId);
	if (hypothesis.taskId) throw conflict('Une tâche vérifie déjà cette hypothèse.');
	const step = currentMilestone(await deps.milestones.ofProject(hypothesis.projectId));
	const task = await deps.tasks.create(
		{
			id: deps.newId(),
			projectId: hypothesis.projectId,
			title: verificationTitle(hypothesis),
			milestoneId: step?.id ?? null
		},
		actorId
	);
	return save(deps, { ...hypothesis, taskId: task.id });
};

/** Settling a bet is a decision the team will want to find again. */
export const judgeHypothesis =
	(deps: RoadmapDeps) =>
	async (id: string, verdict: 'true' | 'false', why: string, actorId: string) => {
		const hypothesis = await existing(deps, id, actorId);
		ensure(hypothesis.verdict === 'open', 'Cette hypothèse est déjà tranchée.');
		// The verdict comes from the work done to check it, not from a hunch.
		const task = hypothesis.taskId ? await deps.tasks.get(hypothesis.taskId, actorId) : null;
		ensure(task?.status === 'done', 'Termine d’abord la tâche qui la vérifie.');
		const judged = await save(deps, { ...hypothesis, verdict });
		await recordDecision(
			deps,
			{
				id: deps.newId(),
				projectId: judged.projectId,
				text: verdictDecision(judged, verdict),
				why,
				taskId: judged.taskId,
				hypothesisId: judged.id
			},
			actorId,
			'verdict'
		);
		return judged;
	};

/** The week's value of the project's one number; typing it again replaces it. */
export const recordReading =
	(deps: RoadmapDeps) =>
	async (input: { projectId: string; day: string; value: number }, actorId: string) => {
		await deps.access.assertMember(input.projectId, actorId);
		const weekOf = validWeekOf(input.day);
		const reading: MetricReading = {
			id: readingId(input.projectId, weekOf),
			projectId: input.projectId,
			weekOf,
			value: validMetricValue(input.value),
			by: actorId,
			at: deps.clock.now().toISOString()
		};
		await deps.readings.put(reading);
		deps.readingFeed.saved(reading);
		return reading;
	};
