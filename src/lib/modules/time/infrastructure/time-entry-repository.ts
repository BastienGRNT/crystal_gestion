import { and, eq, isNull } from 'drizzle-orm';
import { isoOrNull, parseOptionalDate, type Executor } from '$lib/server/db/types';
import type { TimeEntryChanges, TimeEntryRepository } from '../application/ports';
import type { TimeEntry } from '../domain/time-entry';
import { timeEntries } from './schema';

export const toEntry = (row: typeof timeEntries.$inferSelect): TimeEntry => ({
	...row,
	startedAt: row.startedAt.toISOString(),
	endedAt: isoOrNull(row.endedAt)
});

const toDates = ({ startedAt, endedAt, taskId }: TimeEntryChanges) => ({
	taskId,
	startedAt: parseOptionalDate(startedAt) ?? undefined,
	endedAt: parseOptionalDate(endedAt)
});

export const drizzleTimeEntryRepository = (db: Executor): TimeEntryRepository => {
	const many = async (where: ReturnType<typeof and>) =>
		(await db.select().from(timeEntries).where(where)).map(toEntry);
	return {
		create: async (entry) => {
			const values = {
				...entry,
				startedAt: new Date(entry.startedAt),
				endedAt: parseOptionalDate(entry.endedAt)
			};
			return toEntry((await db.insert(timeEntries).values(values).returning())[0]);
		},
		update: async (id, changes) =>
			toEntry(
				(
					await db
						.update(timeEntries)
						.set(toDates(changes))
						.where(eq(timeEntries.id, id))
						.returning()
				)[0]
			),
		delete: async (id) => {
			await db.delete(timeEntries).where(eq(timeEntries.id, id));
		},
		findOwned: async (id, userId) =>
			(await many(and(eq(timeEntries.id, id), eq(timeEntries.userId, userId))))[0] ?? null,
		runningForUser: (userId) =>
			many(and(eq(timeEntries.userId, userId), isNull(timeEntries.endedAt))),
		runningForTask: (taskId) =>
			many(and(eq(timeEntries.taskId, taskId), isNull(timeEntries.endedAt))),
		list: (projectId) => many(eq(timeEntries.projectId, projectId))
	};
};
