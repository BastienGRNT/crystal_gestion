import { isActive, QUADRANTS, type Quadrant, type Task } from './task';

const byPosition = (a: Task, b: Task) => a.position - b.position;

export type MatrixBox = Quadrant | 'inbox';

/** Active tasks (to do and in progress) in their box; unsorted ones wait in the inbox. */
export function matrixOf(tasks: Task[]): Record<MatrixBox, Task[]> {
	const boxes: Record<MatrixBox, Task[]> = {
		inbox: [],
		now: [],
		plan: [],
		delegate: [],
		later: []
	};
	for (const task of tasks.filter(isActive)) boxes[task.quadrant ?? 'inbox'].push(task);
	for (const box of ['inbox', ...QUADRANTS] as const) boxes[box].sort(byPosition);
	return boxes;
}

export const BOARD_COLUMNS = ['idea', 'todo', 'doing', 'review', 'done'] as const;
export type BoardColumn = (typeof BOARD_COLUMNS)[number];

/** "À faire" reads in priority order: the matrix decides what comes first. */
export const PRIORITY_ORDER: (Quadrant | null)[] = ['now', 'plan', 'delegate', 'later', null];
const rank = (task: Task) => PRIORITY_ORDER.indexOf(task.quadrant);

export interface Board {
	columns: Record<BoardColumn, Task[]>;
	/** Done tasks older than the window, hidden unless asked for. */
	olderDone: number;
}

/** The "Done" column keeps the last two weeks: enough to see what moved, not a graveyard. */
export function boardOf(tasks: Task[], now: Date, showAllDone = false, doneDays = 14): Board {
	const since = now.getTime() - doneDays * 86_400_000;
	const columns: Record<BoardColumn, Task[]> = {
		idea: [],
		todo: [],
		doing: [],
		review: [],
		done: []
	};
	let olderDone = 0;
	for (const task of tasks) {
		const recent = task.status !== 'done' || Date.parse(task.completedAt ?? '') >= since;
		if (recent || showAllDone) columns[task.status].push(task);
		else olderDone++;
	}
	columns.todo.sort((a, b) => rank(a) - rank(b) || byPosition(a, b));
	columns.doing.sort(byPosition);
	columns.review.sort(byPosition);
	columns.idea.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
	columns.done.sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''));
	return { columns, olderDone };
}

/** Work in progress allowed: two things at a time per person. Finish before starting. */
export const WIP_PER_PERSON = 2;

export const doingCount = (tasks: Task[], userId: string) =>
	tasks.filter((t) => t.status === 'doing' && t.assigneeId === userId).length;

/** Days spent in the current column: a card that does not move is a card to talk about. */
export const daysInColumn = (task: Task, now: Date) =>
	Math.floor((now.getTime() - Date.parse(task.statusChangedAt)) / 86_400_000);

export const STALE_DAYS = 4;

export const ideasOf = (tasks: Task[]) =>
	tasks
		.filter((task) => task.status === 'idea')
		.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
