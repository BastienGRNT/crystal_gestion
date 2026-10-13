import { createTask, deleteTask, updateTask } from './application/manage-tasks';
import type { TaskDeps } from './application/ports';

export function createTasks(deps: TaskDeps) {
	return {
		list: () => deps.tasks.list(),
		create: createTask(deps),
		update: updateTask(deps),
		delete: deleteTask(deps)
	};
}

export type Tasks = ReturnType<typeof createTasks>;
