import { eq, max, sql } from 'drizzle-orm';
import { iso, isoOrNull } from '$lib/server/db/columns';
import type { Db } from '$lib/server/db/types';
import type { Task } from '../domain/task';
import type { TaskRepository } from '../application/ports';
import { taskCounters, tasks } from './schema';

const toTask = (row: typeof tasks.$inferSelect): Task => ({
	...row,
	createdAt: iso(row.createdAt),
	updatedAt: iso(row.updatedAt),
	completedAt: isoOrNull(row.completedAt)
});

const toRow = (task: Task) => ({
	...task,
	createdAt: new Date(task.createdAt),
	updatedAt: new Date(task.updatedAt),
	completedAt: task.completedAt ? new Date(task.completedAt) : null
});

export const drizzleTasks = (db: Db): TaskRepository => ({
	list: async () => (await db.select().from(tasks)).map(toTask),
	async get(id) {
		const [row] = await db.select().from(tasks).where(eq(tasks.id, id));
		return row ? toTask(row) : null;
	},
	async insert(task) {
		await db.insert(tasks).values(toRow(task));
	},
	async save(task) {
		await db.update(tasks).set(toRow(task)).where(eq(tasks.id, task.id));
	},
	async delete(id) {
		await db.delete(tasks).where(eq(tasks.id, id));
	},
	async nextNumber(projectId) {
		const [row] = await db
			.insert(taskCounters)
			.values({ projectId, last: 1 })
			.onConflictDoUpdate({
				target: taskCounters.projectId,
				set: { last: sql`${taskCounters.last} + 1` }
			})
			.returning({ last: taskCounters.last });
		return row.last;
	},
	async lastPosition(projectId) {
		const [row] = await db
			.select({ last: max(tasks.position) })
			.from(tasks)
			.where(eq(tasks.projectId, projectId));
		return row?.last ?? null;
	}
});
