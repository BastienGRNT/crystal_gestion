import { eq, sql, type SQL } from 'drizzle-orm';
import type { Executor } from '$lib/server/db/types';
import { isoOrNull } from '$lib/server/db/types';
import { refColumn } from '../../elements/infrastructure/element-writer';
import { elements } from '../../elements/infrastructure/schema';
import type { Task } from '../domain/task';
import { taskAssignees, tasks } from './schema';

const assigneeIds = sql<
	string[]
>`coalesce((select array_agg(${taskAssignees.userId}) from ${taskAssignees} where ${taskAssignees.taskId} = ${tasks.id}), '{}')`;

export function selectTasks(db: Executor, where: SQL | undefined) {
	return db
		.select({
			task: tasks,
			ref: refColumn,
			title: elements.title,
			createdAt: elements.createdAt,
			updatedAt: elements.updatedAt,
			assigneeIds
		})
		.from(tasks)
		.innerJoin(elements, eq(elements.id, tasks.id))
		.where(where);
}

type Row = Awaited<ReturnType<typeof selectTasks>>[number];

export const toTask = ({ task, ref, title, createdAt, updatedAt, assigneeIds }: Row): Task => ({
	...task,
	kind: 'task',
	ref,
	title,
	assigneeIds,
	completedAt: isoOrNull(task.completedAt),
	createdAt: createdAt.toISOString(),
	updatedAt: updatedAt.toISOString()
});
