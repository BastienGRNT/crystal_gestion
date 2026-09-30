import type { Task } from './task';

export interface Progress {
	done: number;
	total: number;
	ratio: number;
}

export function progressOf(tasks: Pick<Task, 'status'>[]): Progress {
	const done = tasks.filter((task) => task.status === 'done').length;
	return { done, total: tasks.length, ratio: tasks.length ? done / tasks.length : 0 };
}
