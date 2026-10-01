import { and, asc, eq, inArray } from 'drizzle-orm';
import type { Executor } from '$lib/server/db/types';
import { elements } from '../../elements/infrastructure/schema';
import type { ChannelRepository } from '../application/ports';
import type { Channel } from '../domain/channel';
import { channels, messages } from './schema';

const toChannel = (row: typeof channels.$inferSelect): Channel => ({
	...row,
	createdAt: row.createdAt.toISOString()
});

export const drizzleChannelRepository = (db: Executor): ChannelRepository => {
	const owned = (projectId: string, id: string) =>
		and(eq(channels.projectId, projectId), eq(channels.id, id));
	return {
		create: async (channel) =>
			toChannel((await db.insert(channels).values(channel).returning())[0]),
		rename: async (projectId, id, name) => {
			const [row] = await db.update(channels).set({ name }).where(owned(projectId, id)).returning();
			return row ? toChannel(row) : null;
		},
		// Messages are elements: removing their registry rows takes references and activity along.
		delete: (projectId, id) =>
			db.transaction(async (tx) => {
				const inChannel = tx
					.select({ id: messages.id })
					.from(messages)
					.where(eq(messages.channelId, id));
				await tx.delete(elements).where(inArray(elements.id, inChannel));
				return (await tx.delete(channels).where(owned(projectId, id)).returning()).length > 0;
			}),
		find: async (projectId, id) => {
			const [row] = await db.select().from(channels).where(owned(projectId, id));
			return row ? toChannel(row) : null;
		},
		list: async (projectId) =>
			(
				await db
					.select()
					.from(channels)
					.where(eq(channels.projectId, projectId))
					.orderBy(asc(channels.createdAt))
			).map(toChannel)
	};
};
