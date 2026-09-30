import type { Actor } from '$lib/modules/kernel/domain/actor';
import { notFound } from '$lib/modules/kernel/domain/errors';
import type { TaskDeps, TaskTarget } from './deps';

export const makeDeleteTask =
	(deps: TaskDeps) =>
	async (actor: Actor, { projectId, id }: TaskTarget) => {
		const task = await deps.tasks.find(projectId, id);
		if (!task) throw notFound('Tâche');
		await deps.timer.stopForTask(id);
		await deps.tasks.delete(projectId, id);
		deps.feed.deleted('task', projectId, id);
		await deps.activity.record({ projectId, actor, verb: 'deleted', element: task });
	};
