import type { ActivityVerb, NotificationKind, Subject } from '../../kernel/domain/subject';
import { invalid, notFound } from '../../kernel/domain/errors';
import {
	applyPatch,
	defaultReviewer,
	newTask,
	type NewTaskInput,
	type Task,
	type TaskPatch
} from '../domain/task';
import type { TaskDeps } from './ports';

export type CreateTaskInput = Omit<NewTaskInput, 'number' | 'position'> & { position?: number };

const subjectOf = (task: Task): Subject => ({
	kind: 'task',
	id: task.id,
	title: task.title,
	projectId: task.projectId
});

async function checkPeople(deps: TaskDeps, projectId: string, ids: (string | null | undefined)[]) {
	for (const id of ids)
		if (id && !(await deps.access.isMember(projectId, id)))
			throw invalid('Cette personne ne fait pas partie du projet.');
}

async function notify(
	deps: TaskDeps,
	task: Task,
	userId: string | null,
	kind: NotificationKind,
	actorId: string
) {
	if (userId && userId !== actorId)
		await deps.notifier.notify({ userId, actorId, kind, subject: subjectOf(task) });
}

/** The moments worth a line in "ce qui a bougé": not every edit. */
function verbOf(before: Task, after: Task): ActivityVerb | null {
	if (after.status !== before.status) {
		if (after.status === 'doing') return 'task.started';
		if (after.status === 'review') return 'task.review';
		if (after.status === 'done') return 'task.done';
	}
	if (after.blockedReason && !before.blockedReason) return 'task.blocked';
	return null;
}

export const createTask = (deps: TaskDeps) => async (input: CreateTaskInput, actorId: string) => {
	await deps.access.assertMember(input.projectId, actorId);
	await checkPeople(deps, input.projectId, [input.assigneeId]);
	const number = await deps.tasks.nextNumber(input.projectId);
	const position = input.position ?? ((await deps.tasks.lastPosition(input.projectId)) ?? 0) + 1;
	const task = newTask({ ...input, number, position }, actorId, deps.clock.now());
	await deps.tasks.insert(task);
	deps.feed.saved(task);
	await deps.activity.record({ actorId, verb: 'task.created', subject: subjectOf(task) });
	await notify(deps, task, task.assigneeId, 'assigned', actorId);
	return task;
};

async function existing(deps: TaskDeps, id: string, actorId: string) {
	const task = await deps.tasks.get(id);
	if (!task) throw notFound('Tâche');
	await deps.access.assertMember(task.projectId, actorId);
	return task;
}

export const updateTask =
	(deps: TaskDeps) => async (id: string, patch: TaskPatch, actorId: string) => {
		const current = await existing(deps, id, actorId);
		await checkPeople(deps, current.projectId, [patch.assigneeId, patch.reviewerId]);
		let task = applyPatch(current, patch, actorId, deps.clock.now());
		if (task.status === 'review' && current.status !== 'review' && !task.reviewerId)
			task = {
				...task,
				reviewerId: defaultReviewer(task, await deps.access.members(task.projectId), actorId)
			};
		await deps.tasks.save(task);
		deps.feed.saved(task);
		const verb = verbOf(current, task);
		if (verb) await deps.activity.record({ actorId, verb, subject: subjectOf(task) });
		if (task.assigneeId !== current.assigneeId)
			await notify(deps, task, task.assigneeId, 'assigned', actorId);
		const reviewAsked =
			task.status === 'review' &&
			(current.status !== 'review' || task.reviewerId !== current.reviewerId);
		if (reviewAsked) await notify(deps, task, task.reviewerId, 'review', actorId);
		return task;
	};

export const deleteTask = (deps: TaskDeps) => async (id: string, actorId: string) => {
	const task = await existing(deps, id, actorId);
	await deps.tasks.delete(id);
	deps.feed.removed(task);
};

export const getTask = (deps: TaskDeps) => (id: string, actorId: string) =>
	existing(deps, id, actorId);
