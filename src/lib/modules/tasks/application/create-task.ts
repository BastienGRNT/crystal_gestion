import type { Actor } from '$lib/modules/kernel/domain/actor';
import { positionAtEnd } from '../domain/position';
import type { TaskFields, TaskStatus } from '../domain/task';
import type { TaskDeps } from './deps';

export type NewTaskInput = Pick<TaskFields, 'title'> &
	Partial<TaskFields> & { projectId: string; status?: TaskStatus; position?: number };

export const makeCreateTask = (deps: TaskDeps) => async (actor: Actor, input: NewTaskInput) => {
	const status = input.status ?? 'todo';
	const task = await deps.tasks.create({
		description: '',
		featureId: null,
		dueDate: null,
		important: null,
		assigneeIds: [],
		...input,
		status,
		position: input.position ?? positionAtEnd(await deps.tasks.positions(input.projectId, status)),
		createdBy: actor.id
	});
	deps.feed.upserted('task', task.projectId, task);
	if (task.description) await deps.references.sync(task.projectId, task.id, [task.description]);
	await deps.activity.record({ projectId: task.projectId, actor, verb: 'created', element: task });
	await deps.notifier.notify({
		type: 'assigned',
		projectId: task.projectId,
		actor,
		element: task,
		recipientIds: task.assigneeIds
	});
	return task;
};
