import { toDateKey, type DateKey } from '$lib/modules/kernel/domain/dates';
import { validDecisionText, validWhy, type Decision } from '$lib/modules/roadmap/domain/decision';
import {
	cleanMilestonePatch,
	nextMilestone,
	positionForNew,
	validDoneWhen,
	validMilestoneTitle,
	validTargetDate,
	type Milestone,
	type MilestonePatch
} from '$lib/modules/roadmap/domain/milestone';
import {
	readingId,
	validMetricValue,
	validWeekOf,
	type MetricReading
} from '$lib/modules/roadmap/domain/metric';
import type { TemplateKey } from '$lib/modules/roadmap/domain/templates';
import { isOpen } from '$lib/modules/tasks/domain/task';
import { errorMessage, send } from '../api';
import type { AppState } from '../state/app.svelte';
import { deleteWithUndo, toasts } from '../toasts.svelte';
import { milestoneReview } from '../views/milestone-review';
import { stepForecasts } from '../views/roadmap';
import { generalOf } from '../views/workspace';
import type { chatActions } from './chat';
import { attempt, settle } from './optimistic';

export interface DecisionSeed {
	projectId: string;
	text: string;
	why?: string;
	messageId?: string | null;
	taskId?: string | null;
	milestoneId?: string | null;
	supersedes?: string | null;
}

/** The roadmap: steps, decisions, hypotheses and the project's one number. */
export function roadmapActions(app: AppState, chat: ReturnType<typeof chatActions>) {
	async function run<T>(request: Promise<T>): Promise<T | null> {
		try {
			return await request;
		} catch (error) {
			toasts.error(errorMessage(error));
			return null;
		}
	}

	const stepsOf = (projectId: string) =>
		app.milestones.all.filter((m) => m.projectId === projectId);

	function createStep(
		projectId: string,
		fields: { title: string; doneWhen?: string; targetDate?: DateKey | null }
	) {
		const now = new Date();
		const step = attempt<Milestone>(() => ({
			id: crypto.randomUUID(),
			projectId,
			title: validMilestoneTitle(fields.title),
			doneWhen: validDoneWhen(fields.doneWhen ?? ''),
			targetDate: validTargetDate(fields.targetDate ?? null),
			position: positionForNew(stepsOf(projectId)),
			closedAt: null,
			closedBy: null,
			createdBy: app.meId,
			createdAt: now.toISOString()
		}));
		if (!step) return null;
		app.milestones.upsert(step);
		const { id, title, doneWhen, targetDate } = step;
		settle(
			app,
			id,
			send('roadmap.createMilestone', { id, projectId, title, doneWhen, targetDate }),
			(saved) => app.milestones.upsert(saved),
			() => app.milestones.remove(id)
		);
		return step;
	}

	/** `reason`: why the date moves; the server writes the decision that goes with it. */
	function updateStep(id: string, patch: MilestonePatch, reason = '') {
		const current = app.milestones.get(id);
		const clean = current && attempt(() => cleanMilestonePatch(patch));
		if (!current || !clean) return;
		app.milestones.upsert({ ...current, ...clean });
		settle(
			app,
			id,
			send('roadmap.updateMilestone', { id, ...patch, reason }),
			(saved) => app.milestones.upsert(saved),
			() => app.milestones.upsert(current)
		);
	}

	async function moveStep(id: string, direction: 'up' | 'down') {
		const moved = await run(send('roadmap.moveMilestone', { id, direction }));
		if (moved) app.milestones.upsert(moved);
	}

	/** Its tasks stay, without a step. */
	function removeStep(step: Milestone) {
		const tasks = app.tasks.all.filter((t) => t.milestoneId === step.id);
		deleteWithUndo(
			`Étape « ${step.title} » supprimée, ses tâches restent`,
			() => {
				app.milestones.remove(step.id);
				for (const t of tasks) app.tasks.upsert({ ...t, milestoneId: null });
			},
			() => {
				app.milestones.upsert(step);
				for (const t of tasks) app.tasks.upsert(t);
			},
			() =>
				void send('roadmap.deleteMilestone', { id: step.id }, { keepalive: true }).catch(() =>
					app.milestones.upsert(step)
				)
		);
	}

	/**
	 * Closes the step, then posts its review in #général. If the post fails, the step stays
	 * closed: the review is a courtesy, the closing is the decision.
	 */
	async function closeStep(id: string, carry: 'next' | 'ideas', note: string) {
		const step = app.milestones.get(id);
		if (!step) return false;
		const next = nextMilestone(stepsOf(step.projectId), id);
		const leaving = app.tasks.all
			.filter((t) => t.milestoneId === id && isOpen(t))
			.map((t) => t.title);
		const closed = await run(send('roadmap.closeMilestone', { id, carry }));
		if (!closed) return false;
		app.milestones.upsert(closed);
		const steps = stepsOf(closed.projectId);
		const now = new Date();
		const tasks = app.tasks.all.filter((t) => t.projectId === closed.projectId);
		const review = milestoneReview({
			milestone: closed,
			milestones: steps,
			tasks,
			decisions: app.decisions.all,
			note,
			carried: { titles: leaving, to: carry === 'next' ? (next?.title ?? null) : null },
			next,
			nextForecast: next ? stepForecasts(steps, tasks, toDateKey(now), now).get(next.id) : undefined
		});
		const general = generalOf(app.channels.all, closed.projectId);
		const posted = general ? await chat.post(general.id, review) : false;
		toasts.show(posted ? `Étape close : le bilan est dans #général` : 'Étape close', {
			tone: 'success'
		});
		return true;
	}

	async function applyTemplate(projectId: string, template: TemplateKey, deadline: DateKey | null) {
		if (template === 'empty') return true;
		const today = toDateKey(new Date());
		const steps = await run(
			send('roadmap.applyTemplate', { projectId, template, today, deadline })
		);
		for (const step of steps ?? []) app.milestones.upsert(step);
		return steps !== null;
	}

	function decide(seed: DecisionSeed): Decision | null {
		const decision = attempt<Decision>(() => ({
			id: crypto.randomUUID(),
			projectId: seed.projectId,
			text: validDecisionText(seed.text),
			why: validWhy(seed.why ?? ''),
			messageId: seed.messageId ?? null,
			taskId: seed.taskId ?? null,
			milestoneId: seed.milestoneId ?? null,
			hypothesisId: null,
			supersedes: seed.supersedes ?? null,
			source: 'manual',
			decidedBy: app.meId,
			decidedAt: new Date().toISOString()
		}));
		if (!decision) return null;
		app.decisions.upsert(decision);
		const { decidedBy: _, decidedAt: __, hypothesisId: ___, source: ____, ...input } = decision;
		settle(
			app,
			decision.id,
			send('roadmap.createDecision', input),
			(saved) => app.decisions.upsert(saved),
			() => app.decisions.remove(decision.id)
		);
		return decision;
	}

	function removeDecision(decision: Decision) {
		deleteWithUndo(
			'Décision retirée',
			() => app.decisions.remove(decision.id),
			() => app.decisions.upsert(decision),
			() =>
				void send('roadmap.deleteDecision', { id: decision.id }, { keepalive: true }).catch(() =>
					app.decisions.upsert(decision)
				)
		);
	}

	async function addHypothesis(projectId: string, text: string) {
		const created = await run(
			send('roadmap.createHypothesis', { id: crypto.randomUUID(), projectId, text })
		);
		if (created) app.hypotheses.upsert(created);
		return created;
	}

	async function editHypothesis(id: string, text: string) {
		const saved = await run(send('roadmap.updateHypothesis', { id, text }));
		if (saved) app.hypotheses.upsert(saved);
	}

	function removeHypothesis(id: string) {
		const hypothesis = app.hypotheses.get(id);
		if (!hypothesis) return;
		deleteWithUndo(
			'Hypothèse retirée',
			() => app.hypotheses.remove(id),
			() => app.hypotheses.upsert(hypothesis),
			() =>
				void send('roadmap.deleteHypothesis', { id }, { keepalive: true }).catch(() =>
					app.hypotheses.upsert(hypothesis)
				)
		);
	}

	async function verify(id: string) {
		const saved = await run(send('roadmap.verifyHypothesis', { id }));
		if (saved) {
			app.hypotheses.upsert(saved);
			toasts.show('Tâche de vérification ajoutée à l’étape en cours', { tone: 'success' });
		}
		return saved;
	}

	async function judge(id: string, verdict: 'true' | 'false', why = '') {
		const saved = await run(send('roadmap.judgeHypothesis', { id, verdict, why }));
		if (saved) {
			app.hypotheses.upsert(saved);
			toasts.show('Noté dans les décisions', { tone: 'success', duration: 2500 });
		}
	}

	function record(projectId: string, value: number, day = toDateKey(new Date())) {
		const reading = attempt<MetricReading>(() => {
			const weekOf = validWeekOf(day);
			return {
				id: readingId(projectId, weekOf),
				projectId,
				weekOf,
				value: validMetricValue(value),
				by: app.meId,
				at: new Date().toISOString()
			};
		});
		if (!reading) return;
		const before = app.readings.get(reading.id);
		app.readings.upsert(reading);
		settle(
			app,
			reading.id,
			send('roadmap.recordReading', { projectId, day, value }),
			(saved) => app.readings.upsert(saved),
			() => (before ? app.readings.upsert(before) : app.readings.remove(reading.id))
		);
	}

	return {
		createStep,
		updateStep,
		moveStep,
		removeStep,
		closeStep,
		applyTemplate,
		decide,
		removeDecision,
		addHypothesis,
		editHypothesis,
		removeHypothesis,
		verify,
		judge,
		record
	};
}
