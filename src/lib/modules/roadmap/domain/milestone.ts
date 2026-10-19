import { isDateKey, type DateKey } from '../../kernel/domain/dates';
import { ensure, requiredText } from '../../kernel/domain/errors';
import type { Task } from '../../tasks/domain/task';

/**
 * A step of the project: a deliverable with a date. It is at once the breakdown (WBS), the
 * product (PBS), the milestone and the phase. Its date is a budget: when the work overflows,
 * the scope is cut or the date moved on purpose, never silently.
 */
export interface Milestone {
	id: string;
	projectId: string;
	title: string;
	/** "C'est fini quand…": what has to be true to close it. */
	doneWhen: string;
	targetDate: DateKey | null;
	/** Order of the steps, chosen by hand (dragging). The date is a budget, not a sort key. */
	position: number;
	/**
	 * The module it moves forward, when the product has several: steps follow each other within
	 * a module, and modules move in parallel. `null`: the project's own line.
	 */
	componentId: string | null;
	closedAt: string | null;
	closedBy: string | null;
	createdBy: string;
	createdAt: string;
}

export type MilestonePatch = Partial<
	Pick<Milestone, 'title' | 'doneWhen' | 'targetDate' | 'componentId'>
>;

export const validMilestoneTitle = (title: string) => requiredText(title, 'Le nom de l’étape', 80);

export function validDoneWhen(text: string): string {
	ensure(text.length <= 1000, '« C’est fini quand… » est trop long (1000 caractères maximum).');
	return text.trim();
}

export function validTargetDate(date: string | null): DateKey | null {
	ensure(date === null || isDateKey(date), 'Date invalide.');
	return date;
}

export function cleanMilestonePatch(patch: MilestonePatch): MilestonePatch {
	return {
		...(patch.title !== undefined && { title: validMilestoneTitle(patch.title) }),
		...(patch.doneWhen !== undefined && { doneWhen: validDoneWhen(patch.doneWhen) }),
		...(patch.targetDate !== undefined && { targetDate: validTargetDate(patch.targetDate) }),
		...(patch.componentId !== undefined && { componentId: patch.componentId })
	};
}

/** The steps in the order the team set. */
export function orderMilestones<M extends Milestone>(milestones: M[]): M[] {
	return [...milestones].sort((a, b) => a.position - b.position);
}

/** A date earlier than the step before it: worth a word, since the order says otherwise. */
export function datedBeforePrevious(milestones: Milestone[], id: string): boolean {
	const ordered = orderMilestones(milestones);
	const at = ordered.findIndex((m) => m.id === id);
	const date = ordered[at]?.targetDate;
	if (!date) return false;
	return ordered.slice(0, at).some((m) => !m.closedAt && m.targetDate && m.targetDate > date);
}

/** The line a step belongs to: its module, or the project's own line. */
export const laneOf = (milestone: Pick<Milestone, 'componentId'>) => milestone.componentId ?? '';

const sameLane = <M extends Milestone>(milestones: M[], id: string) => {
	const lane = milestones.find((m) => m.id === id);
	return lane ? orderMilestones(milestones.filter((m) => laneOf(m) === laneOf(lane))) : [];
};

/** The steps under way: the first open one of each line (one per module, in parallel). */
export function currentMilestones<M extends Milestone>(milestones: M[]): M[] {
	const seen = new Set<string>();
	return orderMilestones(milestones).filter((m) => {
		if (m.closedAt || seen.has(laneOf(m))) return false;
		seen.add(laneOf(m));
		return true;
	});
}

/** The first step under way, whatever its line: where work without a module goes. */
export const currentMilestone = <M extends Milestone>(milestones: M[]): M | null =>
	orderMilestones(milestones).find((m) => !m.closedAt) ?? null;

/** The open step that comes after this one in its line, if any. */
export function nextMilestone<M extends Milestone>(milestones: M[], id: string): M | null {
	const lane = sameLane(milestones, id);
	const at = lane.findIndex((m) => m.id === id);
	return lane.slice(at + 1).find((m) => !m.closedAt) ?? null;
}

/** When it became a step under way: the closing of the step before it in its line, else its creation. */
export function startedAt(milestones: Milestone[], id: string): string | null {
	const lane = sameLane(milestones, id);
	const at = lane.findIndex((m) => m.id === id);
	if (at < 0) return null;
	const previous = lane[at - 1];
	if (previous && !previous.closedAt) return null;
	return previous?.closedAt ?? lane[at].createdAt;
}

/** Ideas ("pistes") are what could fit: they never count in progress nor in forecasts. */
export const countsIn = (task: Pick<Task, 'status'>) => task.status !== 'idea';

export function progressOf(tasks: Pick<Task, 'status'>[]) {
	const counted = tasks.filter(countsIn);
	return { done: counted.filter((t) => t.status === 'done').length, total: counted.length };
}

/**
 * Where a new step lands: a dated one before the first open step due later (so the order
 * follows the dates by default), an undated one at the end. Dragging changes it afterwards.
 */
export function positionForNew(milestones: Milestone[], targetDate: DateKey | null = null): number {
	const ordered = orderMilestones(milestones);
	if (!ordered.length) return 0;
	const later = targetDate
		? ordered.findIndex((m) => !m.closedAt && m.targetDate && m.targetDate > targetDate)
		: -1;
	if (later < 0) return ordered.at(-1)!.position + 1;
	const before = ordered[later - 1]?.position ?? ordered[later].position - 2;
	return (before + ordered[later].position) / 2;
}

/** `14/11`: short enough for a decision line. */
export const shortDate = (key: DateKey) => `${key.slice(8, 10)}/${key.slice(5, 7)}`;

/** The line written when a step's date moves: a deadline never slips silently. */
export function dateChange(title: string, from: DateKey | null, to: DateKey | null): string {
	if (!to) return `« ${title} » n’a plus de date (c’était le ${shortDate(from!)})`;
	if (!from) return `« ${title} » est prévue pour le ${shortDate(to)}`;
	return `« ${title} » : ${shortDate(from)} → ${shortDate(to)}`;
}

/** The line written when a step is deleted while it promised a date or held work. */
export function removal(title: string, date: DateKey | null, openTasks: number): string {
	const promised = date ? `, prévue le ${shortDate(date)}` : '';
	const s = openTasks > 1 ? 's' : '';
	const detached = openTasks ? ` ; ${openTasks} tâche${s} ouverte${s} sans étape` : '';
	return `Étape « ${title} » supprimée${promised}${detached}`;
}

/** The line written when unfinished work leaves a step at its closing. */
export function carriedOver(title: string, to: string | null, tasks: string[]): string {
	const s = tasks.length > 1 ? 's' : '';
	const count = `${tasks.length} tâche${s}`;
	const where = to ? `reportée${s} à « ${to} »` : `mise${s} en pistes`;
	const list = tasks.slice(0, 5).join(', ') + (tasks.length > 5 ? '…' : '');
	return `Sorti de « ${title} » : ${count} ${where} (${list})`;
}
