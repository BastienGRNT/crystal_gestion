import { addDays, daysBetween, type DateKey } from '$lib/modules/kernel/domain/dates';
import {
	currentMilestones,
	laneOf,
	orderMilestones,
	progressOf,
	type Milestone
} from '$lib/modules/roadmap/domain/milestone';
import type { Task } from '$lib/modules/tasks/domain/task';
import { isWorkLeft, pacePerWeek } from './forecast';

export interface StepForecast {
	done: number;
	total: number;
	/** When the work up to this step should be done, at the current pace. */
	predicted: DateKey | null;
	/** `unknown`: not enough finished work to tell yet. `undated`: no target to compare with. */
	state: 'closed' | 'fits' | 'late' | 'unknown' | 'undated';
	lateDays: number;
	/** Everything counted is done: time to check "c'est fini quand…" and close it. */
	ready: boolean;
}

/**
 * Where each step stands and when it should be done, without anyone entering a percentage or
 * an estimate, at the pace of the last four weeks. A step waits for its own open work, the steps
 * before it in its line (its module), the steps of other modules due earlier (the team does those
 * first), and the tasks without a step (they take time too, except those parked "Plus tard").
 */
export function stepForecasts(
	milestones: Milestone[],
	tasks: Task[],
	today: DateKey,
	now: Date
): Map<string, StepForecast> {
	const perWeek = pacePerWeek(tasks, now);
	const perDay = perWeek === null ? null : perWeek / 7;
	const loose = tasks.filter(
		(t) => isWorkLeft(t) && !t.milestoneId && t.quadrant !== 'later'
	).length;
	const ordered = orderMilestones(milestones);
	const open = new Map(
		ordered.map((m) => [m.id, tasks.filter((t) => t.milestoneId === m.id && isWorkLeft(t)).length])
	);
	const comesFirst = (other: Milestone, step: Milestone) =>
		laneOf(other) === laneOf(step)
			? ordered.indexOf(other) < ordered.indexOf(step)
			: !!other.targetDate && !!step.targetDate && other.targetDate < step.targetDate;
	const result = new Map<string, StepForecast>();
	for (const milestone of ordered) {
		const own = tasks.filter((t) => t.milestoneId === milestone.id);
		const progress = progressOf(own);
		const base = { ...progress, predicted: null, lateDays: 0, ready: false };
		if (milestone.closedAt) {
			result.set(milestone.id, { ...base, state: 'closed' });
			continue;
		}
		const load = ordered
			.filter((m) => !m.closedAt && (m.id === milestone.id || comesFirst(m, milestone)))
			.reduce((sum, m) => sum + open.get(m.id)!, loose);
		const ready = progress.total > 0 && progress.done === progress.total;
		const predicted = perDay ? addDays(today, Math.ceil(load / perDay)) : null;
		const lateDays =
			predicted && milestone.targetDate ? daysBetween(milestone.targetDate, predicted) : 0;
		const state = !milestone.targetDate
			? 'undated'
			: !predicted
				? 'unknown'
				: lateDays > 0
					? 'late'
					: 'fits';
		result.set(milestone.id, { ...base, predicted, state, lateDays: Math.max(0, lateDays), ready });
	}
	return result;
}

/** What the board and the matrix show: the step under way, one step, or everything. */
export type StepScope = 'current' | 'all' | string;

/** The steps under way: one id, or one per module. */
export type CurrentSteps = string | null | ReadonlySet<string>;

const isCurrent = (id: string, current: CurrentSteps) =>
	typeof current === 'string' || current === null ? id === current : current.has(id);

/**
 * Tasks to do or ideas of a step that has not started yet: they wait their turn. What is under
 * way, in review or done always shows, whatever its step (nothing in progress is ever hidden).
 */
export function waitsForLaterStep(task: Task, current: CurrentSteps): boolean {
	if (task.status !== 'todo' && task.status !== 'idea') return false;
	return !!task.milestoneId && !isCurrent(task.milestoneId, current);
}

export function inScope(task: Task, scope: StepScope, current: CurrentSteps): boolean {
	if (scope === 'all' || (task.status !== 'todo' && task.status !== 'idea')) return true;
	if (scope === 'current') return !waitsForLaterStep(task, current);
	return task.milestoneId === scope;
}

/**
 * The step a task created under this scope belongs to. An idea noted while looking at the step
 * under way goes to the general pool of ideas: only picking a step on purpose files it there.
 */
export function stepForScope(
	scope: StepScope,
	currentId: string | null,
	status: Task['status'] = 'todo'
): string | null {
	if (scope === 'all') return null;
	if (scope === 'current') return status === 'idea' ? null : currentId;
	return scope;
}

/** The step a card is compared with: the one shown, or the one under way when showing all. */
export function scopeStep(scope: StepScope, currentId: string | null): string | null {
	return scope === 'all' || scope === 'current' ? currentId : scope;
}

export const projectMilestones = (milestones: Milestone[], projectId: string) =>
	orderMilestones(milestones.filter((m) => m.projectId === projectId));

/** The first step under way of a project (its own line first, then by order). */
export const currentStepOf = (milestones: Milestone[], projectId: string) =>
	currentMilestones(projectMilestones(milestones, projectId))[0] ?? null;

/** Every step under way of a project: one per module, plus the project's own line. */
export const currentStepIds = (milestones: Milestone[], projectId: string): Set<string> =>
	new Set(currentMilestones(projectMilestones(milestones, projectId)).map((m) => m.id));
