import type { Actor } from '$lib/modules/kernel/domain/actor';
import { notFound } from '$lib/modules/kernel/domain/errors';
import type { TaskFields } from '../domain/task';
import type { TaskDeps, TaskTarget } from './deps';

export const makeUpdateTask =
	(deps: TaskDeps) =>
	async (
		actor: Actor,
		{ projectId, id, changes }: TaskTarget & { changes: Partial<TaskFields> }
	) => {
		const before = await deps.tasks.find(projectId, id);
		if (!before) throw notFound('Tâche');
		const task = await deps.tasks.update(projectId, id, changes);
		deps.feed.upserted('task', projectId, task);
		if (changes.description !== undefined)
			await deps.references.sync(projectId, id, [task.description]);
		const newAssignees = task.assigneeIds.filter((userId) => !before.assigneeIds.includes(userId));
		await deps.notifier.notify({
			type: 'assigned',
			projectId,
			actor,
			element: task,
			recipientIds: newAssignees
		});
		await deps.activity.record({ projectId, actor, verb: 'updated', element: task });
		return task;
	};
