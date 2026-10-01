import { makeCreateTask } from './application/create-task';
import { makeDeleteTask } from './application/delete-task';
import type { TaskDeps } from './application/deps';
import { makeMoveTask } from './application/move-task';
import { makeFinishTask, makePauseTask, makeStartTask } from './application/timer-actions';
import { makeUpdateTask } from './application/update-task';

export function createTasksModule(deps: TaskDeps) {
	const move = makeMoveTask(deps);
	return {
		create: makeCreateTask(deps),
		update: makeUpdateTask(deps),
		move,
		remove: makeDeleteTask(deps),
		start: makeStartTask(deps, move),
		pause: makePauseTask(deps),
		finish: makeFinishTask(deps, move),
		list: (projectId: string) => deps.tasks.list(projectId)
	};
}

export type TasksModule = ReturnType<typeof createTasksModule>;
