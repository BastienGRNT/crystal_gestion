import { daysBetween, toDateKey } from '$lib/modules/kernel/domain/dates';
import type { Decision } from '$lib/modules/roadmap/domain/decision';
import {
	carriedOver,
	shortDate,
	startedAt,
	type Milestone
} from '$lib/modules/roadmap/domain/milestone';
import type { Task } from '$lib/modules/tasks/domain/task';
import { plural } from '../format';
import type { StepForecast } from './roadmap';

export interface ReviewInput {
	/** The step just closed. */
	milestone: Milestone;
	milestones: Milestone[];
	tasks: Task[];
	decisions: Decision[];
	/** "À changer pour la suite", in one line, when someone wrote it. */
	note: string;
	/** Unfinished work that left the step at its closing, and where it went. */
	carried: { titles: string[]; to: string | null };
	next: Milestone | null;
	nextForecast: StepForecast | undefined;
}

function timing(milestone: Milestone): string {
	const closedOn = toDateKey(new Date(milestone.closedAt!));
	if (!milestone.targetDate) return `close le ${shortDate(closedOn)}`;
	const late = daysBetween(milestone.targetDate, closedOn);
	const verdict =
		late > 0 ? `${plural(late, 'jour')} de retard` : late < 0 ? `${-late} j d’avance` : 'à l’heure';
	return `close le ${shortDate(closedOn)}, prévue le ${shortDate(milestone.targetDate)} : ${verdict}`;
}

function nextLine(next: Milestone | null, forecast: StepForecast | undefined): string {
	if (!next) return 'C’était la dernière étape.';
	const date = next.targetDate ? `, prévue le ${shortDate(next.targetDate)}` : '';
	const pace =
		forecast?.state === 'late'
			? ` (au rythme actuel : +${forecast.lateDays} j)`
			: forecast?.state === 'fits'
				? ' (au rythme actuel, ça tient)'
				: '';
	return `Prochaine étape : « ${next.title} »${date}${pace}.`;
}

/**
 * The step's review, written by the app at the closing and posted in #général: planned and
 * actual dates, work done and work added on the way, decisions taken meanwhile. Nobody writes
 * a retrospective; the one human line is optional.
 */
export function milestoneReview(input: ReviewInput): string {
	const { milestone, tasks, decisions } = input;
	const since = startedAt(input.milestones, milestone.id) ?? milestone.createdAt;
	const until = milestone.closedAt!;
	const done = tasks.filter((t) => t.milestoneId === milestone.id && t.status === 'done');
	// A minute of grace: tasks laid out with the step (by a template) were not added on the way.
	const addedAfter = new Date(Date.parse(since) + 60_000).toISOString();
	const added = done.filter((t) => t.createdAt > addedAfter).length;
	// Said from what was sent, not from the decision: its echo may not be here yet.
	const carried = input.carried.titles.length
		? carriedOver(milestone.title, input.carried.to, input.carried.titles)
		: null;
	const taken = decisions.filter(
		(d) =>
			d.projectId === milestone.projectId &&
			d.decidedAt >= since &&
			d.decidedAt <= until &&
			d.text !== carried
	);
	return [
		`Étape « ${milestone.title} » ${timing(milestone)}.`,
		`${plural(done.length, 'tâche terminée', 'tâches terminées')}${added ? `, dont ${added} ajoutée${added > 1 ? 's' : ''} en route` : ''}.`,
		...(carried ? [carried] : []),
		...(taken.length ? [`Décidé pendant l’étape :`, ...taken.map((d) => `- ${d.text}`)] : []),
		...(input.note.trim() ? [`À changer pour la suite : ${input.note.trim()}`] : []),
		nextLine(input.next, input.nextForecast)
	].join('\n');
}
