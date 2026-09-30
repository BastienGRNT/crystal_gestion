import { and, desc, eq, isNull } from 'drizzle-orm';
import type { Executor } from '$lib/server/db/types';
import { isoOrNull } from '$lib/server/db/types';
import type { NotificationRepository } from '../application/ports';
import type { Notification } from '../domain/notification';
import { notifications } from './schema';

const toNotification = (row: typeof notifications.$inferSelect): Notification => ({
	...row,
	readAt: isoOrNull(row.readAt),
	createdAt: row.createdAt.toISOString()
});

export const drizzleNotificationRepository = (db: Executor): NotificationRepository => ({
	insertMany: async (rows) =>
		(await db.insert(notifications).values(rows).returning()).map(toNotification),
	listForUser: async (userId, projectId, limit) =>
		(
			await db
				.select()
				.from(notifications)
				.where(and(eq(notifications.userId, userId), eq(notifications.projectId, projectId)))
				.orderBy(desc(notifications.createdAt))
				.limit(limit)
		).map(toNotification),
	markRead: async (userId, projectId, at) => {
		await db
			.update(notifications)
			.set({ readAt: at })
			.where(
				and(
					eq(notifications.userId, userId),
					eq(notifications.projectId, projectId),
					isNull(notifications.readAt)
				)
			);
	}
});
