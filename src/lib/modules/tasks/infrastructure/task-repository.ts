import { and, eq } from 'drizzle-orm';
import { parseOptionalDate, type Executor } from '$lib/server/db/types';
import {
	deleteElement,
	insertElement,
	updateElement
} from '../../elements/infrastructure/element-writer';
import type { TaskRepository } from '../application/ports';
import { STATUS_LABELS } from '../domain/task';
import { taskAssignees, tasks } from './schema';
import { selectTasks, toTask } from './task-query';

async function replaceAssignees(tx: Executor, taskId: string, userIds: string[]) {
	await tx.delete(taskAssignees).where(eq(taskAssignees.taskId, taskId));
	if (userIds.length)
		await tx.insert(taskAssignees).values(userIds.map((userId) => ({ taskId, userId })));
}

export const drizzleTaskRepository = (db: Executor): TaskRepository => {
	const find = async (projectId: string, id: string) => {
		const [row] = await selectTasks(db, and(eq(tasks.projectId, projectId), eq(tasks.id, id)));
		return row ? toTask(row) : null;
	};
	return {
		find,
		list: async (projectId) => (await selectTasks(db, eq(tasks.projectId, projectId))).map(toTask),
		positions: async (projectId, status) =>
			(
				await db
					.select({ position: tasks.position })
					.from(tasks)
					.where(and(eq(tasks.projectId, projectId), eq(tasks.status, status)))
			).map((row) => row.position),
		create: async ({ title, createdBy, assigneeIds, ...fields }) => {
			const id = await db.transaction(async (tx) => {
				const element = await insertElement(tx, {
					projectId: fields.projectId,
					kind: 'task',
					title,
					createdBy,
					status: STATUS_LABELS[fields.status]
				});
				await tx.insert(tasks).values({ id: element.id, ...fields });
				await replaceAssignees(tx, element.id, assigneeIds);
				return element.id;
			});
			return (await find(fields.projectId, id))!;
		},
		update: async (projectId, id, { title, assigneeIds, ...fields }) => {
			await db.transaction(async (tx) => {
				const completedAt = parseOptionalDate(fields.completedAt);
				if (Object.keys(fields).length)
					await tx
						.update(tasks)
						.set({ ...fields, completedAt })
						.where(eq(tasks.id, id));
				if (assigneeIds) await replaceAssignees(tx, id, assigneeIds);
				await updateElement(tx, id, {
					title,
					status: fields.status && STATUS_LABELS[fields.status]
				});
			});
			return (await find(projectId, id))!;
		},
		delete: (_projectId, id) => deleteElement(db, id)
	};
};
