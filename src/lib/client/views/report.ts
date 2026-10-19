import { daysBetween, type DateKey } from '$lib/modules/kernel/domain/dates';
import type { Project } from '$lib/modules/projects/domain/project';
import type { Decision } from '$lib/modules/roadmap/domain/decision';
import type { Metric, MetricReading } from '$lib/modules/roadmap/domain/metric';
import type { Release } from '$lib/modules/roadmap/domain/release';
import {
	currentMilestone,
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
	const current = currentMilestone(steps);
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
				!waitsForLaterStep(t, current?.id ?? null)
		)
		.sort(
			(a, b) =>
				PRIORITY_ORDER.indexOf(a.quadrant) - PRIORITY_ORDER.indexOf(b.quadrant) ||
				(a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999')
		)
		.slice(0, UPCOMING);
	const decided = roadmap.decisions
		.filter((d) => d.projectId === project.id && Date.parse(d.decidedAt) >= weekAgo)
		.map((d) => d.text);
	return [
		`${project.name} : le point du ${longDate(today)}`,
		'',
		...stepLines(steps, all, today, now),
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
		...section(
			'Ensuite',
			upcoming.map((t) => `${t.title}${due(t)}`)
		),
		...metricLines(project, roadmap, today),
		...(audience === 'team' ? rhythmLines(all, weekAgo) : []),
		...deliveryLine(project, all, steps, today, now)
	]
		.join('\n')
		.trim();
}

function stepLines(steps: Milestone[], tasks: Task[], today: DateKey, now: Date): string[] {
	const ordered = orderMilestones(steps);
	const current = currentMilestone(steps);
	if (!current) return [];
	const forecast = stepForecasts(steps, tasks, today, now).get(current.id)!;
	const rank = `${ordered.indexOf(current) + 1}/${ordered.length}`;
	const date = current.targetDate ? `, prévue le ${shortDate(current.targetDate)}` : '';
	const pace =
		forecast.state === 'late'
			? ` : au rythme actuel, ${forecast.lateDays} j de retard`
			: forecast.state === 'fits'
				? ' : au rythme actuel, ça tient'
				: '';
	const next = ordered[ordered.indexOf(current) + 1];
	const after = next
		? [
				`Prochaine étape : ${next.title}${next.targetDate ? `, prévue le ${shortDate(next.targetDate)}` : ''}.`
			]
		: [];
	return [
		`Étape en cours (${rank}) : ${current.title}, ${forecast.done}/${forecast.total} tâches${date}${pace}.`,
		...after,
		''
	];
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
