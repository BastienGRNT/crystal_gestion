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
	activeMetrics,
	parseMetricLine,
	readingId,
	validMetricName,
	validMetricValue,
	validTarget,
	validUnit,
	validWeekOf,
	type Metric,
	type MetricReading
} from '$lib/modules/roadmap/domain/metric';
import type { Release } from '$lib/modules/roadmap/domain/release';
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
	/** Proposed by the assistant, accepted by me. */
	source?: 'manual' | 'ai';
}

/** The roadmap: steps, decisions, hypotheses, the project's numbers and its versions. */
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
		fields: {
			title: string;
			doneWhen?: string;
			targetDate?: DateKey | null;
			componentId?: string | null;
		}
	) {
		const now = new Date();
		const step = attempt<Milestone>(() => ({
			id: crypto.randomUUID(),
			projectId,
			title: validMilestoneTitle(fields.title),
			doneWhen: validDoneWhen(fields.doneWhen ?? ''),
			targetDate: validTargetDate(fields.targetDate ?? null),
			position: positionForNew(stepsOf(projectId), fields.targetDate ?? null),
			componentId: fields.componentId ?? null,
			closedAt: null,
			closedBy: null,
			createdBy: app.meId,
			createdAt: now.toISOString()
		}));
		if (!step) return null;
		app.milestones.upsert(step);
		const { id, title, doneWhen, targetDate, componentId } = step;
		settle(
			app,
			id,
			send('roadmap.createMilestone', { id, projectId, title, doneWhen, targetDate, componentId }),
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

	/** Dragging a step to its new place. */
	function moveStep(id: string, position: number) {
		const current = app.milestones.get(id);
		if (!current || current.position === position) return;
		app.milestones.upsert({ ...current, position });
		settle(
			app,
			id,
			send('roadmap.reorderMilestone', { id, position }),
			(saved) => app.milestones.upsert(saved),
			() => app.milestones.upsert(current)
		);
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
			source: seed.source ?? 'manual',
			decidedBy: app.meId,
			decidedAt: new Date().toISOString()
		}));
		if (!decision) return null;
		app.decisions.upsert(decision);
		const { decidedBy: _, decidedAt: __, hypothesisId: ___, source, ...input } = decision;
		settle(
			app,
			decision.id,
			send('roadmap.createDecision', { ...input, source: source === 'ai' ? 'ai' : 'manual' }),
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

	const metricsOf = (projectId: string) =>
		activeMetrics(app.metrics.all.filter((m) => m.projectId === projectId));

	/** "Clients payants 40" reads the target from the line; `fields` say it outright. */
	function addMetric(
		projectId: string,
		line: string,
		fields: { unit?: string; target?: number | null; direction?: Metric['direction'] } = {}
	) {
		const parsed = { ...parseMetricLine(line), ...fields };
		const others = metricsOf(projectId);
		const metric = attempt<Metric>(() => ({
			id: crypto.randomUUID(),
			projectId,
			name: validMetricName(parsed.name),
			unit: validUnit(parsed.unit),
			target: validTarget(parsed.target),
			direction: fields.direction ?? 'up',
			position: Math.max(0, ...others.map((m) => m.position)) + 1,
			archivedAt: null,
			createdAt: new Date().toISOString()
		}));
		if (!metric) return null;
		const { id, name, unit, target, direction } = metric;
		app.metrics.upsert(metric);
		settle(
			app,
			id,
			send('roadmap.createMetric', { id, projectId, name, unit, target, direction }),
			(saved) => app.metrics.upsert(saved),
			() => app.metrics.remove(id)
		);
		return metric;
	}

	function updateMetric(
		id: string,
		patch: Partial<Pick<Metric, 'name' | 'unit' | 'target' | 'direction'>> & { archived?: boolean }
	) {
		const current = app.metrics.get(id);
		if (!current) return;
		const { archived, ...fields } = patch;
		const next = attempt<Metric>(() => ({
			...current,
			...fields,
			...(fields.name !== undefined && { name: validMetricName(fields.name) }),
			...(fields.unit !== undefined && { unit: validUnit(fields.unit) }),
			...(fields.target !== undefined && { target: validTarget(fields.target) }),
			...(archived !== undefined && { archivedAt: archived ? new Date().toISOString() : null })
		}));
		if (!next) return;
		app.metrics.upsert(next);
		settle(
			app,
			id,
			send('roadmap.updateMetric', { id, ...patch }),
			(saved) => app.metrics.upsert(saved),
			() => app.metrics.upsert(current)
		);
	}

	function removeMetric(metric: Metric) {
		deleteWithUndo(
			`« ${metric.name} » n’est plus suivi`,
			() => app.metrics.remove(metric.id),
			() => app.metrics.upsert(metric),
			() =>
				void send(
					'roadmap.updateMetric',
					{ id: metric.id, archived: true },
					{ keepalive: true }
				).catch(() => app.metrics.upsert(metric))
		);
	}

	/** One value per week: typing it again the same week replaces it. */
	function record(metric: Metric, value: number, day = toDateKey(new Date())) {
		const reading = attempt<MetricReading>(() => {
			const weekOf = validWeekOf(day);
			return {
				id: readingId(metric.id, weekOf),
				metricId: metric.id,
				projectId: metric.projectId,
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
			send('roadmap.recordReading', { metricId: metric.id, day, value }),
			(saved) => app.readings.upsert(saved),
			() => (before ? app.readings.upsert(before) : app.readings.remove(reading.id))
		);
	}

	/**
	 * "C'est en prod": the version takes the chosen tasks, then its notes are posted in
	 * #général so the team sees what left.
	 */
	async function ship(input: {
		projectId: string;
		name: string;
		taskIds: string[];
		notes: string;
	}) {
		const release = await run<Release>(
			send('roadmap.shipRelease', { id: crypto.randomUUID(), ...input })
		);
		if (!release) return null;
		app.releases.upsert(release);
		for (const id of input.taskIds) {
			const task = app.tasks.get(id);
			if (task) app.tasks.upsert({ ...task, releaseId: release.id });
		}
		const general = generalOf(app.channels.all, input.projectId);
		if (general) await chat.post(general.id, `🚀 ${release.changelog}`);
		toasts.show(`${release.name} est en prod`, { tone: 'success' });
		return release;
	}

	async function updateRelease(id: string, patch: { name?: string; notes?: string }) {
		const saved = await run<Release>(send('roadmap.updateRelease', { id, ...patch }));
		if (saved) app.releases.upsert(saved);
	}

	function removeRelease(release: Release) {
		const tasks = app.tasks.all.filter((t) => t.releaseId === release.id);
		deleteWithUndo(
			`${release.name} annulée : ses tâches sont de nouveau prêtes à partir`,
			() => {
				app.releases.remove(release.id);
				for (const t of tasks) app.tasks.upsert({ ...t, releaseId: null });
			},
			() => {
				app.releases.upsert(release);
				for (const t of tasks) app.tasks.upsert(t);
			},
			() =>
				void send('roadmap.deleteRelease', { id: release.id }, { keepalive: true }).catch(() =>
					app.releases.upsert(release)
				)
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
		addMetric,
		updateMetric,
		removeMetric,
		record,
		ship,
		updateRelease,
		removeRelease
	};
}
