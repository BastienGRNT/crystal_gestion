import { and, desc, eq, inArray, isNull } from 'drizzle-orm';
import { iso, isoOrNull } from '$lib/server/db/columns';
import type { Db } from '$lib/server/db/types';
import type { ActivityVerb } from '../../kernel/domain/subject';
import type { Activity, Notification } from '../domain/activity';
import type { ActivityRepository, NotificationRepository } from '../application/ports';
import { activities, notifications } from './schema';

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
	recent: async (limit) =>
		(await db.select().from(activities).orderBy(desc(activities.createdAt)).limit(limit)).map(
			toActivity
		)
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
