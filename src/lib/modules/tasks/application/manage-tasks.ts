import type { Subject } from '../../kernel/domain/subject';
import { invalid, notFound } from '../../kernel/domain/errors';
import { applyPatch, newTask, type NewTaskInput, type Task, type TaskPatch } from '../domain/task';
import type { TaskDeps } from './ports';

export type CreateTaskInput = Omit<NewTaskInput, 'number' | 'position'> & { position?: number };

const subjectOf = (task: Task): Subject => ({
	kind: 'task',
	id: task.id,
	title: task.title,
	projectId: task.projectId
});

async function checkAssignee(deps: TaskDeps, assigneeId: string | null | undefined) {
	if (assigneeId && !(await deps.directory.userExists(assigneeId)))
		throw invalid('Cette personne ne fait pas partie de l’équipe.');
}

/** Tells someone a task is now theirs, unless they gave it to themselves. */
async function notifyAssignee(deps: TaskDeps, task: Task, actorId: string) {
	if (task.assigneeId && task.assigneeId !== actorId)
		await deps.notifier.notify({
			userId: task.assigneeId,
			actorId,
			kind: 'assigned',
			subject: subjectOf(task)
		});
}

export const createTask = (deps: TaskDeps) => async (input: CreateTaskInput, actorId: string) => {
	if (!(await deps.directory.projectExists(input.projectId))) throw notFound('Projet');
	await checkAssignee(deps, input.assigneeId);
	const number = await deps.tasks.nextNumber(input.projectId);
	const position = input.position ?? ((await deps.tasks.lastPosition(input.projectId)) ?? 0) + 1;
	const task = newTask({ ...input, number, position }, actorId, deps.clock.now());
	await deps.tasks.insert(task);
	deps.feed.saved(task);
	await deps.activity.record({ actorId, verb: 'task.created', subject: subjectOf(task) });
	await notifyAssignee(deps, task, actorId);
	return task;
};

export const updateTask =
	(deps: TaskDeps) => async (id: string, patch: TaskPatch, actorId: string) => {
		const current = await deps.tasks.get(id);
		if (!current) throw notFound('Tâche');
		await checkAssignee(deps, patch.assigneeId);
		const task = applyPatch(current, patch, actorId, deps.clock.now());
		await deps.tasks.save(task);
		deps.feed.saved(task);
		if (task.status !== current.status && (task.status === 'doing' || task.status === 'done'))
			await deps.activity.record({
				actorId,
				verb: task.status === 'doing' ? 'task.started' : 'task.done',
				subject: subjectOf(task)
			});
		if (task.assigneeId !== current.assigneeId) await notifyAssignee(deps, task, actorId);
		return task;
	};

export const deleteTask = (deps: TaskDeps) => async (id: string) => {
	await deps.tasks.delete(id);
	deps.feed.removed(id);
};
