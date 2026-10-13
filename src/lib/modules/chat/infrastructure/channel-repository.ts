import { and, asc, eq, inArray, sql } from 'drizzle-orm';
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
	ofProjects: async (ids) =>
		ids.length
			? (
					await db
						.select()
						.from(channels)
						.where(inArray(channels.projectId, ids))
						.orderBy(asc(channels.createdAt))
				).map(toChannel)
			: [],
	async get(id) {
		const [row] = await db.select().from(channels).where(eq(channels.id, id));
		return row ? toChannel(row) : null;
	},
	async generalOf(projectId) {
		const [row] = await db
			.select()
			.from(channels)
			.where(and(eq(channels.projectId, projectId), eq(channels.kind, 'general')));
		return row ? toChannel(row) : null;
	},
	async ofTask(taskId) {
		const [row] = await db.select().from(channels).where(eq(channels.taskId, taskId));
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
	/** Someone who just joined a project starts with nothing unread rather than its whole history. */
	async states(userId, projectIds) {
		if (!projectIds.length) return [];
		const mention = `%<@${userId}>%`;
		const rows = await db.execute<{
			channel_id: string;
			last_read_at: Date | null;
			unread: number;
			mentions: number;
			total: number;
		}>(sql`
			select c.id as channel_id, r.last_read_at,
				count(m.id) filter (where m.author_id <> ${userId} and m.created_at > coalesce(r.last_read_at, pm.joined_at))::int as unread,
				count(m.id) filter (where m.author_id <> ${userId} and m.created_at > coalesce(r.last_read_at, pm.joined_at) and m.body like ${mention})::int as mentions,
				count(m.id)::int as total
			from channels c
			join project_members pm on pm.project_id = c.project_id and pm.user_id = ${userId}
			left join channel_reads r on r.channel_id = c.id and r.user_id = ${userId}
			left join messages m on m.channel_id = c.id
			where c.project_id in (${sql.join(
				projectIds.map((id) => sql`${id}::uuid`),
				sql`, `
			)})
			group by c.id, r.last_read_at`);
		return rows.map((row): ChannelState => ({
			channelId: row.channel_id,
			lastReadAt: row.last_read_at ? new Date(row.last_read_at).toISOString() : null,
			unread: row.unread,
			mentions: row.mentions,
			total: row.total
		}));
	}
});
