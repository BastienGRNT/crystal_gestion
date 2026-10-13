import { and, desc, eq, inArray, isNull, sql } from 'drizzle-orm';
import { iso, isoOrNull } from '$lib/server/db/columns';
import type { Db } from '$lib/server/db/types';
import type { ActivityVerb } from '../../kernel/domain/subject';
import type { Activity, Notification } from '../domain/activity';
import type {
	ActivityRepository,
	NotificationRepository,
	VisitRepository
} from '../application/ports';
import { activities, notifications, projectVisits } from './schema';

const toActivity = (row: typeof activities.$inferSelect): Activity => ({
	...row,
	verb: row.verb as ActivityVerb,
	createdAt: iso(row.createdAt)
});

const toNotification = (row: typeof notifications.$inferSelect): Notification => ({
	...row,
	createdAt: iso(row.createdAt),
	readAt: isoOrNull(row.readAt)
});

export const drizzleActivities = (db: Db): ActivityRepository => ({
	async insert(activity) {
		await db.insert(activities).values({ ...activity, createdAt: new Date(activity.createdAt) });
	},
	async recent(projectIds, perProject) {
		if (!projectIds.length) return [];
		const ranked = db
			.select({
				id: activities.id,
				rank: sql<number>`row_number() over (partition by ${activities.projectId} order by ${activities.createdAt} desc)`.as(
					'rank'
				)
			})
			.from(activities)
			.where(inArray(activities.projectId, projectIds))
			.as('ranked');
		const rows = await db
			.select({ activity: activities })
			.from(activities)
			.innerJoin(ranked, eq(ranked.id, activities.id))
			.where(sql`${ranked.rank} <= ${perProject}`)
			.orderBy(desc(activities.createdAt));
		return rows.map((row) => toActivity(row.activity));
	}
});

export const drizzleNotifications = (db: Db): NotificationRepository => ({
	async insert(notification) {
		await db.insert(notifications).values({
			...notification,
			createdAt: new Date(notification.createdAt),
			readAt: null
		});
	},
	forUser: async (userId, limit) =>
		(
			await db
				.select()
				.from(notifications)
				.where(eq(notifications.userId, userId))
				.orderBy(desc(notifications.createdAt))
				.limit(limit)
		).map(toNotification),
	async markRead(userId, ids, at) {
		if (ids !== 'all' && ids.length === 0) return [];
		const rows = await db
			.update(notifications)
			.set({ readAt: at })
			.where(
				and(
					eq(notifications.userId, userId),
					isNull(notifications.readAt),
					ids === 'all' ? undefined : inArray(notifications.id, ids)
				)
			)
			.returning();
		return rows.map(toNotification);
	}
});

export const drizzleVisits = (db: Db): VisitRepository => ({
	of: async (userId) =>
		(await db.select().from(projectVisits).where(eq(projectVisits.userId, userId))).map((row) => ({
			...row,
			seenAt: iso(row.seenAt)
		})),
	async save(visit) {
		const seenAt = new Date(visit.seenAt);
		await db
			.insert(projectVisits)
			.values({ ...visit, seenAt })
			.onConflictDoUpdate({
				target: [projectVisits.userId, projectVisits.projectId],
				set: { seenAt }
			});
	}
});
