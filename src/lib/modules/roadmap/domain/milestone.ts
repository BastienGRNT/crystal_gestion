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
	/** Order among the steps without a date. */
	position: number;
	closedAt: string | null;
	closedBy: string | null;
	createdBy: string;
	createdAt: string;
}

export type MilestonePatch = Partial<Pick<Milestone, 'title' | 'doneWhen' | 'targetDate'>>;

export const validMilestoneTitle = (title: string) => requiredText(title, 'Le nom de l’étape', 60);

export function validDoneWhen(text: string): string {
	ensure(text.length <= 200, '« C’est fini quand… » est trop long (200 caractères maximum).');
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
		...(patch.targetDate !== undefined && { targetDate: validTargetDate(patch.targetDate) })
	};
}

/** Dated steps by date, then the ones without a date (what comes "later") in their order. */
export function orderMilestones<M extends Milestone>(milestones: M[]): M[] {
	return [...milestones].sort((a, b) => {
		if (a.targetDate && b.targetDate)
			return a.targetDate.localeCompare(b.targetDate) || a.position - b.position;
		if (a.targetDate) return -1;
		if (b.targetDate) return 1;
		return a.position - b.position;
	});
}

/** The step under way: the first one not closed yet. */
export const currentMilestone = <M extends Milestone>(milestones: M[]): M | null =>
	orderMilestones(milestones).find((m) => !m.closedAt) ?? null;

/** The open step that comes after this one, if any. */
export function nextMilestone<M extends Milestone>(milestones: M[], id: string): M | null {
	const ordered = orderMilestones(milestones);
	const at = ordered.findIndex((m) => m.id === id);
	return ordered.slice(at + 1).find((m) => !m.closedAt) ?? null;
}

/** When it became the step under way: the previous step's closing, else its creation. */
export function startedAt(milestones: Milestone[], id: string): string | null {
	const ordered = orderMilestones(milestones);
	const at = ordered.findIndex((m) => m.id === id);
	if (at < 0) return null;
	const previous = ordered[at - 1];
	if (previous && !previous.closedAt) return null;
	return previous?.closedAt ?? ordered[at].createdAt;
}

/** Ideas ("pistes") are what could fit: they never count in progress nor in forecasts. */
export const countsIn = (task: Pick<Task, 'status'>) => task.status !== 'idea';

export function progressOf(tasks: Pick<Task, 'status'>[]) {
	const counted = tasks.filter(countsIn);
	return { done: counted.filter((t) => t.status === 'done').length, total: counted.length };
}

/**
 * Where a step without a date lands when added: right after the step under way, or first of
 * the undated ones, so a closing step like "Vie du produit" stays last.
 */
export function positionForNew(milestones: Milestone[]): number {
	const undated = orderMilestones(milestones.filter((m) => !m.targetDate));
	if (!undated.length) return 0;
	const current = currentMilestone(milestones);
	const at = current && !current.targetDate ? undated.indexOf(current) : -1;
	const before = at >= 0 ? undated[at].position : undefined;
	const after = undated[at + 1]?.position;
	if (before === undefined) return after! - 1;
	return after === undefined ? before + 1 : (before + after) / 2;
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
