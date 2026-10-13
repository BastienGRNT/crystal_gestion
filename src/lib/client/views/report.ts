import { daysBetween, type DateKey } from '$lib/modules/kernel/domain/dates';
import type { Project } from '$lib/modules/projects/domain/project';
import { PRIORITY_ORDER } from '$lib/modules/tasks/domain/views';
import type { Task } from '$lib/modules/tasks/domain/task';
import { dayLabel, longDate } from '../format';
import { deliveryForecast } from './forecast';

const WEEK_MS = 7 * 86_400_000;
const UPCOMING = 5;

/**
 * The week of a project in plain text, ready to paste in an email to the client or a message:
 * what got done, what is under way, what is stuck, what comes next, and whether the date holds.
 */
export function weekReport(
	project: Project,
	tasks: Task[],
	nameOf: (userId: string | null) => string | null,
	today: DateKey,
	now: Date
): string {
	const mine = tasks.filter((t) => t.projectId === project.id);
	const by = (t: Task) => (nameOf(t.assigneeId) ? ` (${nameOf(t.assigneeId)})` : '');
	const due = (t: Task) => (t.dueDate ? `, pour ${dayLabel(t.dueDate, today).toLowerCase()}` : '');
	const section = (title: string, lines: string[]) =>
		lines.length ? [`${title} (${lines.length})`, ...lines.map((l) => `- ${l}`), ''] : [];
	const done = mine
		.filter(
			(t) => t.status === 'done' && Date.parse(t.completedAt ?? '') >= now.getTime() - WEEK_MS
		)
		.map((t) => t.title);
	const blocked = mine.filter((t) => t.blockedReason && t.status !== 'done');
	const doing = mine.filter(
		(t) => (t.status === 'doing' || t.status === 'review') && !t.blockedReason
	);
	// "Plus tard" is, by definition, not what comes next.
	const upcoming = mine
		.filter((t) => t.status === 'todo' && !t.blockedReason && t.quadrant !== 'later')
		.sort(
			(a, b) =>
				PRIORITY_ORDER.indexOf(a.quadrant) - PRIORITY_ORDER.indexOf(b.quadrant) ||
				(a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999')
		)
		.slice(0, UPCOMING);
	return [
		`${project.name} : le point du ${longDate(today)}`,
		'',
		...section('Terminé cette semaine', done),
		...section(
			'En cours',
			doing.map((t) => `${t.title}${t.status === 'review' ? ', en relecture' : ''}${by(t)}`)
		),
		...section(
			'Bloqué',
			blocked.map((t) => `${t.title} : ${t.blockedReason}`)
		),
		...section(
			'Ensuite',
			upcoming.map((t) => `${t.title}${due(t)}`)
		),
		...deliveryLine(project, mine, today, now)
	]
		.join('\n')
		.trim();
}

function deliveryLine(project: Project, tasks: Task[], today: DateKey, now: Date): string[] {
	if (!project.deadline) return [];
	const days = daysBetween(today, project.deadline);
	const forecast = deliveryForecast(tasks, project.deadline, today, now);
	const when = days < 0 ? `dépassée de ${-days} j` : days === 0 ? 'aujourd’hui' : `dans ${days} j`;
	const pace = forecast
		? forecast.fits
			? ' : au rythme actuel, ça tient.'
			: ' : au rythme actuel, il faudra choisir quoi repousser.'
		: '.';
	return [`Livraison ${when}${pace}`];
}
