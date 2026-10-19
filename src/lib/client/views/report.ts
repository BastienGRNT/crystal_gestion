import { daysBetween, type DateKey } from '$lib/modules/kernel/domain/dates';
import type { Project } from '$lib/modules/projects/domain/project';
import type { Decision } from '$lib/modules/roadmap/domain/decision';
import { latestReadings, type MetricReading } from '$lib/modules/roadmap/domain/metric';
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
import { stepForecasts, waitsForLaterStep } from './roadmap';

const WEEK_MS = 7 * 86_400_000;
const UPCOMING = 5;

/** The roadmap of the project, when it has one: steps, decisions and its one number. */
export interface ReportRoadmap {
	milestones: Milestone[];
	decisions: Decision[];
	readings: MetricReading[];
}

const NO_ROADMAP: ReportRoadmap = { milestones: [], decisions: [], readings: [] };

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
	roadmap: ReportRoadmap = NO_ROADMAP
): string {
	const mine = tasks.filter((t) => t.projectId === project.id);
	const steps = roadmap.milestones.filter((m) => m.projectId === project.id);
	const current = currentMilestone(steps);
	const weekAgo = now.getTime() - WEEK_MS;
	const by = (t: Task) => (nameOf(t.assigneeId) ? ` (${nameOf(t.assigneeId)})` : '');
	const due = (t: Task) => (t.dueDate ? `, pour ${dayLabel(t.dueDate, today).toLowerCase()}` : '');
	const section = (title: string, lines: string[]) =>
		lines.length ? [`${title} (${lines.length})`, ...lines.map((l) => `- ${l}`), ''] : [];
	const done = mine
		.filter((t) => t.status === 'done' && Date.parse(t.completedAt ?? '') >= weekAgo)
		.map((t) => t.title);
	const blocked = mine.filter((t) => t.blockedReason && t.status !== 'done');
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
		...stepLines(steps, mine, today, now),
		...section('Terminé cette semaine', done),
		...section(
			'En cours',
			doing.map((t) => `${t.title}${t.status === 'review' ? ', en relecture' : ''}${by(t)}`)
		),
		...section(
			'Bloqué',
			blocked.map((t) => `${t.title} : ${t.blockedReason}`)
		),
		...section('Décidé cette semaine', decided),
		...section(
			'Ensuite',
			upcoming.map((t) => `${t.title}${due(t)}`)
		),
		...metricLines(project, roadmap.readings),
		...deliveryLine(project, mine, steps, today, now)
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

function metricLines(project: Project, readings: MetricReading[]): string[] {
	const [last, previous] = latestReadings(readings.filter((r) => r.projectId === project.id));
	if (!project.metricName || !last) return [];
	const target = project.metricTarget !== null ? ` / ${project.metricTarget}` : '';
	// Rounded: 0.1 + 0.2 must not read 0.30000000000000004 in a mail to the client.
	const diff = previous ? Math.round((last.value - previous.value) * 100) / 100 : 0;
	const trend = diff ? ` (${diff > 0 ? '+' : ''}${diff} sur la semaine)` : '';
	return [`${project.metricName} : ${last.value}${target}${trend}`, ''];
}

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
