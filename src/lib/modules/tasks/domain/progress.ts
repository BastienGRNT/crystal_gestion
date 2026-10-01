import type { Task } from './task';

export interface Progress {
	done: number;
	total: number;
	ratio: number;
}

/** Icebox tasks are not committed to, so they do not count. */
export function progressOf(tasks: Pick<Task, 'status'>[]): Progress {
	const counted = tasks.filter((task) => task.status !== 'icebox');
	const done = counted.filter((task) => task.status === 'done').length;
	return { done, total: counted.length, ratio: counted.length ? done / counted.length : 0 };
}
