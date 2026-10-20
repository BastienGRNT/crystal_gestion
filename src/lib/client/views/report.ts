import { daysBetween, type DateKey } from '$lib/modules/kernel/domain/dates';
import type { Stakeholder, Story } from '$lib/modules/framing/domain/framing';
import { storyState } from './framing';
import type { Project } from '$lib/modules/projects/domain/project';
import type { Decision } from '$lib/modules/roadmap/domain/decision';
import type { Metric, MetricReading } from '$lib/modules/roadmap/domain/metric';
import type { Release } from '$lib/modules/roadmap/domain/release';
import {
	currentMilestones,
	orderMilestones,
	shortDate,
	type Milestone
} from '$lib/modules/roadmap/domain/milestone';
import { PRIORITY_ORDER } from '$lib/modules/tasks/domain/views';
import type { Task } from '$lib/modules/tasks/domain/task';
import { dayLabel, longDate } from '../format';
import { deliveryForecast } from './forecast';
import { metricViews } from './metrics';
import { stepForecasts, waitsForLaterStep } from './roadmap';

const WEEK_MS = 7 * 86_400_000;
const UPCOMING = 5;

/** The roadmap of the project, when it has one: steps, decisions, numbers and versions. */
export interface ReportRoadmap {
	milestones: Milestone[];
	decisions: Decision[];
	metrics?: Metric[];
	readings: MetricReading[];
	releases?: Release[];
	/** Days spent so far (from the planning), compared to the days sold. */
	spentDays?: number;
	/** The product's modules, to name the steps under way of each. */
	components?: { id: string; name: string }[];
	/** The functional spec's stories: those finished this week are told in its words. */
	stories?: Story[];
	/** Who to keep informed, and how often. */
	stakeholders?: Stakeholder[];
}

const NO_ROADMAP: ReportRoadmap = { milestones: [], decisions: [], readings: [] };

/**
 * `client`: what they care about (new features and fixes, what we wait for from them).
 * `team`: everything, with the rhythm.
 */
export type ReportAudience = 'client' | 'team';

const FOR_CLIENT = (t: Task) => t.kind === 'feature' || t.kind === 'bug';
const KIND_WORD: Partial<Record<Task['kind'], string>> = { bug: 'Correction : ' };
/** A blocking reason that says the ball is in the client's court. */
const WAITS_ON_CLIENT = /client|vous|validation|retour/i;

/**
 * The week of a project in plain text, ready to paste in an email to the client or a message:
 * the step under way, what got done, what is under way, what is stuck, what was decided, what
 * comes next, the project's number and whether the date holds.
 */
export function weekReport(
	project: Project,
	tasks: Task[],
	nameOf: (userId: string | null) => string | null,
	today: DateKey,
	now: Date,
	roadmap: ReportRoadmap = NO_ROADMAP,
	audience: ReportAudience = 'team'
): string {
	const all = tasks.filter((t) => t.projectId === project.id);
	const mine = audience === 'client' ? all.filter(FOR_CLIENT) : all;
	const steps = roadmap.milestones.filter((m) => m.projectId === project.id);
	const current = new Set(currentMilestones(steps).map((m) => m.id));
	const weekAgo = now.getTime() - WEEK_MS;
	const by = (t: Task) => (nameOf(t.assigneeId) ? ` (${nameOf(t.assigneeId)})` : '');
	const due = (t: Task) => (t.dueDate ? `, pour ${dayLabel(t.dueDate, today).toLowerCase()}` : '');
	const section = (title: string, lines: string[]) =>
		lines.length ? [`${title} (${lines.length})`, ...lines.map((l) => `- ${l}`), ''] : [];
	const done = mine
		.filter((t) => t.status === 'done' && Date.parse(t.completedAt ?? '') >= weekAgo)
		.map((t) => `${KIND_WORD[t.kind] ?? ''}${t.title}`);
	const stuck = all.filter((t) => t.blockedReason && t.status !== 'done');
	const waitingForClient = stuck.filter((t) => WAITS_ON_CLIENT.test(t.blockedReason!));
	const blocked =
		audience === 'client'
			? stuck.filter((t) => FOR_CLIENT(t) && !waitingForClient.includes(t))
			: stuck;
	const shipped = (roadmap.releases ?? [])
		.filter((r) => r.projectId === project.id && Date.parse(r.shippedAt) >= weekAgo)
		.map((r) => `${r.name}, le ${shortDate(r.shippedAt.slice(0, 10))}`);
	const doing = mine.filter(
		(t) => (t.status === 'doing' || t.status === 'review') && !t.blockedReason
	);
	// "Plus tard" and the steps to come are, by definition, not what comes next.
	const upcoming = mine
		.filter(
			(t) =>
				t.status === 'todo' &&
				!t.blockedReason &&
				t.quadrant !== 'later' &&
				!waitsForLaterStep(t, current)
		)
		.sort(
			(a, b) =>
				PRIORITY_ORDER.indexOf(a.quadrant) - PRIORITY_ORDER.indexOf(b.quadrant) ||
				(a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999')
		)
		.slice(0, UPCOMING);
	const delivered = (roadmap.stories ?? [])
		.filter((s) => s.projectId === project.id)
		.filter((s) => {
			const state = storyState(s, all);
			if (state !== 'delivered' && state !== 'shipped') return false;
			const last = Math.max(
				...all.filter((t) => t.storyId === s.id).map((t) => Date.parse(t.completedAt ?? '') || 0)
			);
			return last >= weekAgo;
		})
		.map((s) => s.want.charAt(0).toUpperCase() + s.want.slice(1));
	const stepClosed = steps.some((m) => m.closedAt && Date.parse(m.closedAt) >= weekAgo);
	const toInform = (roadmap.stakeholders ?? [])
		.filter((s) => s.projectId === project.id && !s.userId)
		.filter(
			(s) =>
				s.informEvery === 'week' ||
				(s.informEvery === 'step' && stepClosed) ||
				(s.informEvery === 'release' && shipped.length > 0)
		)
		.map((s) => `${s.name}${s.organization ? ` (${s.organization})` : ''}`);
	const decided = roadmap.decisions
		.filter((d) => d.projectId === project.id && Date.parse(d.decidedAt) >= weekAgo)
		.map((d) => d.text);
	return [
		`${project.name} : le point du ${longDate(today)}`,
		'',
		...stepLines(steps, all, today, now, roadmap.components ?? []),
		...section('Ce que vous pouvez faire maintenant', delivered),
		...section('Terminé cette semaine', done),
		...section(
			'En cours',
			doing.map((t) => `${t.title}${t.status === 'review' ? ', en relecture' : ''}${by(t)}`)
		),
		...section(
			'Bloqué',
			blocked.map((t) => `${t.title} : ${t.blockedReason}`)
		),
		...section('Mis en prod', shipped),
		...(audience === 'client'
			? section(
					'Ce qu’on attend de vous',
					waitingForClient.map((t) => `${t.title} : ${t.blockedReason}`)
				)
			: []),
		...(audience === 'team' ? section('Décidé cette semaine', decided) : []),
		...(audience === 'team' ? section('À informer cette semaine', toInform) : []),
		...section(
			'Ensuite',
			upcoming.map((t) => `${t.title}${due(t)}`)
		),
		...metricLines(project, roadmap, today),
		...(audience === 'team' ? rhythmLines(all, weekAgo) : []),
		...(audience === 'team' && project.soldDays && roadmap.spentDays !== undefined
			? [
					`Budget : ${roadmap.spentDays.toLocaleString('fr')} j passés sur ${project.soldDays.toLocaleString('fr')} vendus (${Math.round((roadmap.spentDays / project.soldDays) * 100)} %)`,
					''
				]
			: []),
		...deliveryLine(project, all, steps, today, now)
	]
		.join('\n')
		.trim();
}

function stepLines(
	steps: Milestone[],
	tasks: Task[],
	today: DateKey,
	now: Date,
	components: { id: string; name: string }[]
): string[] {
	const ordered = orderMilestones(steps);
	const under = currentMilestones(steps);
	if (!under.length) return [];
	const forecasts = stepForecasts(steps, tasks, today, now);
	const describe = (current: Milestone) => {
		const forecast = forecasts.get(current.id)!;
		const date = current.targetDate ? `, prévue le ${shortDate(current.targetDate)}` : '';
		const pace =
			forecast.state === 'late'
				? ` : au rythme actuel, ${forecast.lateDays} j de retard`
				: forecast.state === 'fits'
					? ' : au rythme actuel, ça tient'
					: '';
		return `${current.title}, ${forecast.done}/${forecast.total} tâches${date}${pace}`;
	};
	// Several modules move at once: one line each.
	if (under.length > 1) {
		const nameOf = (m: Milestone) =>
			components.find((c) => c.id === m.componentId)?.name ?? 'Projet';
		return [
			`Étapes en cours (${under.length})`,
			...under.map((m) => `- ${nameOf(m)} : ${describe(m)}`),
			''
		];
	}
	const [current] = under;
	const rank = `${ordered.indexOf(current) + 1}/${ordered.length}`;
	const next = ordered[ordered.indexOf(current) + 1];
	const after = next
		? [
				`Prochaine étape : ${next.title}${next.targetDate ? `, prévue le ${shortDate(next.targetDate)}` : ''}.`
			]
		: [];
	return [`Étape en cours (${rank}) : ${describe(current)}.`, ...after, ''];
}

function metricLines(project: Project, roadmap: ReportRoadmap, today: DateKey): string[] {
	const views = metricViews(
		(roadmap.metrics ?? []).filter((m) => m.projectId === project.id),
		roadmap.readings.filter((r) => r.projectId === project.id),
		today
	).filter((v) => v.last !== null);
	return views.length
		? [
				...views.map(({ metric, last, delta }) => {
					const unit = metric.unit ? ` ${metric.unit}` : '';
					const target = metric.target !== null ? ` / ${metric.target}${unit}` : '';
					const trend = delta ? ` (${delta > 0 ? '+' : ''}${delta} sur la semaine)` : '';
					return `${metric.name} : ${last}${metric.target !== null ? '' : unit}${target}${trend}`;
				}),
				''
			]
		: [];
}

/** For the team only: how the week went, by kind, and the bugs left. */
function rhythmLines(tasks: Task[], since: number): string[] {
	const done = tasks.filter((t) => t.status === 'done' && Date.parse(t.completedAt ?? '') >= since);
	const count = (kind: Task['kind']) => done.filter((t) => t.kind === kind).length;
	const parts = [
		[count('feature'), 'fonctionnalité'],
		[count('bug'), 'correction'],
		[count('tech'), 'technique', 'technique'],
		[count('action'), 'action']
	]
		.filter(([n]) => n)
		.map(([n, one, many]) => `${n} ${Number(n) > 1 ? (many ?? `${one}s`) : one}`);
	const openBugs = tasks.filter((t) => t.kind === 'bug' && isOpenWork(t)).length;
	if (!done.length && !openBugs) return [];
	return [
		`Rythme : ${done.length} terminée${done.length > 1 ? 's' : ''}${parts.length ? ` (${parts.join(', ')})` : ''}, ${openBugs} bug${openBugs > 1 ? 's' : ''} ouvert${openBugs > 1 ? 's' : ''}`,
		''
	];
}

const isOpenWork = (t: Task) => ['todo', 'doing', 'review'].includes(t.status);

function deliveryLine(
	project: Project,
	tasks: Task[],
	steps: Milestone[],
	today: DateKey,
	now: Date
): string[] {
	if (!project.deadline) return [];
	const days = daysBetween(today, project.deadline);
	const forecast = deliveryForecast(
		tasks,
		project.deadline,
		today,
		now,
		dueByDelivery(project, steps)
	);
	const when = days < 0 ? `dépassée de ${-days} j` : days === 0 ? 'aujourd’hui' : `dans ${days} j`;
	const pace = forecast
		? forecast.fits
			? ' : au rythme actuel, ça tient.'
			: ' : au rythme actuel, il faudra choisir quoi repousser.'
		: '.';
	return [`Livraison ${when}${pace}`];
}

/**
 * The work the delivery waits for: tasks without a step, and the steps due by then. A step
 * planned after the delivery (the launch, the life of the product) does not make it late.
 */
export function dueByDelivery(project: Project, steps: Milestone[]) {
	const after = new Set(
		steps
			.filter((m) => m.projectId === project.id && project.deadline)
			.filter((m) => !m.targetDate || m.targetDate > project.deadline!)
			.map((m) => m.id)
	);
	return (task: Task) => !task.milestoneId || !after.has(task.milestoneId);
}
