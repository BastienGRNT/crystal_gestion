import { asc, eq, sql } from 'drizzle-orm';
import { iso } from '$lib/server/db/columns';
import type { Db } from '$lib/server/db/types';
import type { Channel, ChannelState } from '../domain/chat';
import type { ChannelRepository, ReadRepository } from '../application/ports';
import { channelReads, channels } from './schema';

const toChannel = (row: typeof channels.$inferSelect): Channel => ({
	...row,
	createdAt: iso(row.createdAt)
});
const toRow = (channel: Channel) => ({ ...channel, createdAt: new Date(channel.createdAt) });

export const drizzleChannels = (db: Db): ChannelRepository => ({
	list: async () =>
		(await db.select().from(channels).orderBy(asc(channels.createdAt))).map(toChannel),
	async get(id) {
		const [row] = await db.select().from(channels).where(eq(channels.id, id));
		return row ? toChannel(row) : null;
	},
	async findGeneral() {
		const [row] = await db.select().from(channels).where(eq(channels.kind, 'general')).limit(1);
		return row ? toChannel(row) : null;
	},
	async insert(channel) {
		await db.insert(channels).values(toRow(channel));
	},
	async save(channel) {
		await db.update(channels).set(toRow(channel)).where(eq(channels.id, channel.id));
	},
	async delete(id) {
		await db.delete(channels).where(eq(channels.id, id));
	}
});

export const drizzleReads = (db: Db): ReadRepository => ({
	async markRead(userId, channelId, at) {
		await db
			.insert(channelReads)
			.values({ userId, channelId, lastReadAt: at })
			.onConflictDoUpdate({
				target: [channelReads.userId, channelReads.channelId],
				set: {
					lastReadAt: sql`greatest(${channelReads.lastReadAt}, ${at.toISOString()}::timestamptz)`
				}
			});
	},
	/** Someone who just joined starts with nothing unread rather than the whole history. */
	async states(userId) {
		const mention = `%<@${userId}>%`;
		const rows = await db.execute<{
			channel_id: string;
			last_read_at: Date | null;
			unread: number;
			mentions: number;
		}>(sql`
			select c.id as channel_id, r.last_read_at,
				count(m.id) filter (where m.author_id <> ${userId})::int as unread,
				count(m.id) filter (where m.author_id <> ${userId} and m.body like ${mention})::int as mentions
			from channels c
			left join channel_reads r on r.channel_id = c.id and r.user_id = ${userId}
			left join messages m on m.channel_id = c.id and m.created_at > coalesce(
				r.last_read_at, (select created_at from users where id = ${userId})
			)
			group by c.id, r.last_read_at`);
		return rows.map((row): ChannelState => ({
			channelId: row.channel_id,
			lastReadAt: row.last_read_at ? new Date(row.last_read_at).toISOString() : null,
			unread: row.unread,
			mentions: row.mentions
		}));
	}
});
