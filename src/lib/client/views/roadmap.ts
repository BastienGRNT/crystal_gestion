import { addDays, daysBetween, type DateKey } from '$lib/modules/kernel/domain/dates';
import {
	currentMilestone,
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
 * an estimate. Step N waits for the open work of steps 1 to N and of the tasks without a step
 * (they take time too), finished at the pace of the last four weeks.
 */
export function stepForecasts(
	milestones: Milestone[],
	tasks: Task[],
	today: DateKey,
	now: Date
): Map<string, StepForecast> {
	const perWeek = pacePerWeek(tasks, now);
	const perDay = perWeek === null ? null : perWeek / 7;
	let load = tasks.filter((t) => isWorkLeft(t) && !t.milestoneId).length;
	const result = new Map<string, StepForecast>();
	for (const milestone of orderMilestones(milestones)) {
		const own = tasks.filter((t) => t.milestoneId === milestone.id);
		const progress = progressOf(own);
		const base = { ...progress, predicted: null, lateDays: 0, ready: false };
		if (milestone.closedAt) {
			result.set(milestone.id, { ...base, state: 'closed' });
			continue;
		}
		load += own.filter(isWorkLeft).length;
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

/**
 * Tasks to do or ideas of a step that has not started yet: they wait their turn. What is under
 * way, in review or done always shows, whatever its step (nothing in progress is ever hidden).
 */
export function waitsForLaterStep(task: Task, currentId: string | null): boolean {
	if (task.status !== 'todo' && task.status !== 'idea') return false;
	return !!task.milestoneId && task.milestoneId !== currentId;
}

export function inScope(task: Task, scope: StepScope, currentId: string | null): boolean {
	if (scope === 'all' || (task.status !== 'todo' && task.status !== 'idea')) return true;
	if (scope === 'current') return !waitsForLaterStep(task, currentId);
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

export const currentStepOf = (milestones: Milestone[], projectId: string) =>
	currentMilestone(milestones.filter((m) => m.projectId === projectId));
