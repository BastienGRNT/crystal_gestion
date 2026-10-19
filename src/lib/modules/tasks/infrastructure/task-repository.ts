import { eq, inArray, max, sql } from 'drizzle-orm';
import { iso, isoOrNull } from '$lib/server/db/columns';
import type { Db } from '$lib/server/db/types';
import type { Component } from '../domain/component';
import type { Task } from '../domain/task';
import type { ComponentRepository, TaskRepository } from '../application/ports';
import { components, taskCounters, tasks } from './schema';

const toTask = (row: typeof tasks.$inferSelect): Task => ({
	...row,
	createdAt: iso(row.createdAt),
	updatedAt: iso(row.updatedAt),
	statusChangedAt: iso(row.statusChangedAt),
	startedAt: isoOrNull(row.startedAt),
	completedAt: isoOrNull(row.completedAt)
});

const toRow = (task: Task) => ({
	...task,
	createdAt: new Date(task.createdAt),
	updatedAt: new Date(task.updatedAt),
	statusChangedAt: new Date(task.statusChangedAt),
	startedAt: task.startedAt ? new Date(task.startedAt) : null,
	completedAt: task.completedAt ? new Date(task.completedAt) : null
});

export const drizzleTasks = (db: Db): TaskRepository => ({
	ofProjects: async (ids) =>
		ids.length
			? (await db.select().from(tasks).where(inArray(tasks.projectId, ids))).map(toTask)
			: [],
	ofMilestone: async (id) =>
		(await db.select().from(tasks).where(eq(tasks.milestoneId, id))).map(toTask),
	ofRelease: async (id) =>
		(await db.select().from(tasks).where(eq(tasks.releaseId, id))).map(toTask),
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

export const drizzleComponents = (db: Db): ComponentRepository => {
	const toItem = (row: typeof components.$inferSelect): Component => ({
		...row,
		archivedAt: isoOrNull(row.archivedAt),
		createdAt: iso(row.createdAt)
	});
	const toRow = (c: Component) => ({
		...c,
		archivedAt: c.archivedAt ? new Date(c.archivedAt) : null,
		createdAt: new Date(c.createdAt)
	});
	return {
		ofProjects: async (ids) =>
			ids.length
				? (await db.select().from(components).where(inArray(components.projectId, ids))).map(toItem)
				: [],
		ofProject: async (id) =>
			(await db.select().from(components).where(eq(components.projectId, id))).map(toItem),
		async get(id) {
			const [row] = await db.select().from(components).where(eq(components.id, id));
			return row ? toItem(row) : null;
		},
		async put(c) {
			const row = toRow(c);
			await db
				.insert(components)
				.values(row)
				.onConflictDoUpdate({ target: components.id, set: row });
		},
		async delete(id) {
			await db.delete(components).where(eq(components.id, id));
		}
	};
};
