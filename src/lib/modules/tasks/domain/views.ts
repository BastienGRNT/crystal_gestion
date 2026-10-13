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

export const BOARD_COLUMNS = ['todo', 'doing', 'done'] as const;
export type BoardColumn = (typeof BOARD_COLUMNS)[number];

export interface Board {
	columns: Record<BoardColumn, Task[]>;
	/** Done tasks older than the window, hidden unless asked for. */
	olderDone: number;
}

/** The "Done" column keeps the last two weeks: enough to see what moved, not a graveyard. */
export function boardOf(tasks: Task[], now: Date, showAllDone = false, doneDays = 14): Board {
	const since = now.getTime() - doneDays * 86_400_000;
	const columns: Record<BoardColumn, Task[]> = { todo: [], doing: [], done: [] };
	let olderDone = 0;
	for (const task of tasks) {
		if (task.status === 'idea') continue;
		const recent = task.status !== 'done' || Date.parse(task.completedAt ?? '') >= since;
		if (recent || showAllDone) columns[task.status].push(task);
		else olderDone++;
	}
	columns.todo.sort(byPosition);
	columns.doing.sort(byPosition);
	columns.done.sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''));
	return { columns, olderDone };
}

export const ideasOf = (tasks: Task[]) =>
	tasks
		.filter((task) => task.status === 'idea')
		.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
