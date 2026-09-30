import type { Actor } from '$lib/modules/kernel/domain/actor';
import { notFound } from '$lib/modules/kernel/domain/errors';
import { positionAtEnd } from '../domain/position';
import { STATUS_LABELS, type TaskStatus } from '../domain/task';
import type { TaskDeps, TaskTarget } from './deps';

export type TaskMove = TaskTarget & { status: TaskStatus; position?: number };

/** Moving to "done" stamps completion and stops every timer running on the task. */
export const makeMoveTask =
	(deps: TaskDeps) =>
	async (actor: Actor, { projectId, id, status, position }: TaskMove) => {
		const before = await deps.tasks.find(projectId, id);
		if (!before) throw notFound('Tâche');
		const statusChanged = before.status !== status;
		const task = await deps.tasks.update(projectId, id, {
			status,
			position:
				position ??
				(statusChanged
					? positionAtEnd(await deps.tasks.positions(projectId, status))
					: before.position),
			completedAt: status === 'done' ? (before.completedAt ?? deps.clock.now().toISOString()) : null
		});
		deps.feed.upserted('task', projectId, task);
		if (!statusChanged) return task;
		if (status === 'done') await deps.timer.stopForTask(id);
		await deps.activity.record({
			projectId,
			actor,
			verb: status === 'done' ? 'completed' : 'moved',
			element: task,
			details: { from: STATUS_LABELS[before.status], to: STATUS_LABELS[status] }
		});
		return task;
	};
