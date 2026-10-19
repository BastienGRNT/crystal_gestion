import { createComponent, deleteComponent, updateComponent } from './application/components';
import { createTask, deleteTask, getTask, updateTask } from './application/manage-tasks';
import type { TaskDeps } from './application/ports';

export function createTasks(deps: TaskDeps) {
	return {
		ofProjects: (projectIds: string[]) => deps.tasks.ofProjects(projectIds),
		componentsOf: (projectIds: string[]) => deps.components.ofProjects(projectIds),
		/** A task the actor may see (for comments on it). */
		get: getTask(deps),
		create: createTask(deps),
		update: updateTask(deps),
		delete: deleteTask(deps),
		createComponent: createComponent(deps),
		updateComponent: updateComponent(deps),
		deleteComponent: deleteComponent(deps)
	};
}

export type Tasks = ReturnType<typeof createTasks>;
