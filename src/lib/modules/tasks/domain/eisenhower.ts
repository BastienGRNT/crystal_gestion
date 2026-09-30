import { daysUntil } from '$lib/modules/kernel/domain/dates';
import { isImportantPriority, type Moscow } from '$lib/modules/features/domain/feature';
import type { Task } from './task';

export const URGENCY_THRESHOLD_DAYS = 3;

export const QUADRANTS = ['do', 'plan', 'ifTime', 'later'] as const;
export type Quadrant = (typeof QUADRANTS)[number];

export const QUADRANT_LABELS: Record<Quadrant, string> = {
	do: 'Faire maintenant',
	plan: 'Planifier',
	ifTime: 'Si j’ai le temps',
	later: 'Plus tard'
};

type Classifiable = Pick<Task, 'important' | 'dueDate'>;

export const isImportant = (task: Classifiable, featurePriority: Moscow | null) =>
	task.important ?? isImportantPriority(featurePriority);

export const isUrgent = (task: Classifiable, today: Date) =>
	task.dueDate !== null && daysUntil(task.dueDate, today) <= URGENCY_THRESHOLD_DAYS;

export function quadrantOf(
	task: Classifiable,
	featurePriority: Moscow | null,
	today: Date
): Quadrant {
	const important = isImportant(task, featurePriority);
	const urgent = isUrgent(task, today);
	if (important) return urgent ? 'do' : 'plan';
	return urgent ? 'ifTime' : 'later';
}

/** Earliest deadline first, undated tasks last, then oldest first. */
export const byDeadline = (a: Task, b: Task) =>
	(a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999') ||
	a.createdAt.localeCompare(b.createdAt);

export function groupByQuadrant(
	tasks: Task[],
	priorityOf: (featureId: string | null) => Moscow | null,
	today: Date
) {
	const groups = Object.fromEntries(QUADRANTS.map((q) => [q, [] as Task[]])) as Record<
		Quadrant,
		Task[]
	>;
	for (const task of tasks) groups[quadrantOf(task, priorityOf(task.featureId), today)].push(task);
	for (const quadrant of QUADRANTS) groups[quadrant].sort(byDeadline);
	return groups;
}
