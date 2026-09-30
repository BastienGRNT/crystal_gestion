import type { Actor } from '$lib/modules/kernel/domain/actor';
import type { TaskDeps, TaskTarget } from './deps';
import type { makeMoveTask } from './move-task';

type MoveTask = ReturnType<typeof makeMoveTask>;

/** "Lancer": the task goes in progress and the actor's timer starts on it. */
export const makeStartTask =
	(deps: TaskDeps, moveTask: MoveTask) => async (actor: Actor, target: TaskTarget) => {
		const task = await moveTask(actor, { ...target, status: 'in_progress' });
		await deps.timer.start(target.projectId, actor.id, target.id);
		return task;
	};

export const makePauseTask = (deps: TaskDeps) => async (actor: Actor) =>
	deps.timer.stopForUser(actor.id);

/** "Terminer": moving to done stops the timer and records the time spent. */
export const makeFinishTask = (moveTask: MoveTask) => (actor: Actor, target: TaskTarget) =>
	moveTask(actor, { ...target, status: 'done' });
