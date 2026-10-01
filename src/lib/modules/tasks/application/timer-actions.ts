import type { Actor } from '$lib/modules/kernel/domain/actor';
import { notFound } from '$lib/modules/kernel/domain/errors';
import { finishedStatus } from '../domain/task';
import type { TaskDeps, TaskTarget } from './deps';
import type { makeMoveTask } from './move-task';

type MoveTask = ReturnType<typeof makeMoveTask>;

/** "Démarrer le chrono": the task goes in progress and the actor's timer starts on it. */
export const makeStartTask =
	(deps: TaskDeps, moveTask: MoveTask) => async (actor: Actor, target: TaskTarget) => {
		const task = await moveTask(actor, { ...target, status: 'in_progress' });
		const timer = await deps.timer.start(target.projectId, actor.id, target.id);
		return { task, timer };
	};

export const makePauseTask = (deps: TaskDeps) => async (actor: Actor) =>
	deps.timer.stopForUser(actor.id);

/** Ticking a task: done, or « À valider » for its reviewer, who is then notified. */
export const makeFinishTask =
	(deps: TaskDeps, moveTask: MoveTask) => async (actor: Actor, target: TaskTarget) => {
		const before = await deps.tasks.find(target.projectId, target.id);
		if (!before) throw notFound('Tâche');
		const status = finishedStatus(before, actor.id);
		const task = await moveTask(actor, { ...target, status });
		if (status === 'review' && before.status !== 'review')
			await deps.notifier.notify({
				type: 'review',
				projectId: task.projectId,
				actor,
				element: task,
				recipientIds: [before.reviewerId!]
			});
		return task;
	};
