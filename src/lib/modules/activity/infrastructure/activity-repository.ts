import { desc, eq } from 'drizzle-orm';
import type { Executor } from '$lib/server/db/types';
import type { ActivityRepository } from '../application/ports';
import type { Activity } from '../domain/activity';
import { activities } from './schema';

const toActivity = (row: typeof activities.$inferSelect): Activity => ({
	...row,
	createdAt: row.createdAt.toISOString()
});

export const drizzleActivityRepository = (db: Executor): ActivityRepository => ({
	insert: async (activity) =>
		toActivity((await db.insert(activities).values(activity).returning())[0]),
	listRecent: async (projectId, limit) =>
		(
			await db
				.select()
				.from(activities)
				.where(eq(activities.projectId, projectId))
				.orderBy(desc(activities.createdAt))
				.limit(limit)
		).map(toActivity)
});
