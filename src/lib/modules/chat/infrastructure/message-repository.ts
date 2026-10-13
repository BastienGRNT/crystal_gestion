import { and, asc, desc, eq, inArray, isNull, lt, sql } from 'drizzle-orm';
import { iso, isoOrNull } from '$lib/server/db/columns';
import type { Db } from '$lib/server/db/types';
import { files } from '../../files/infrastructure/schema';
import type { Attachment, Message } from '../domain/chat';
import type { MessageRepository } from '../application/ports';
import { messages } from './schema';

type Row = typeof messages.$inferSelect;

const toMessage = (row: Row, attachments: Attachment[]): Message => ({
	...row,
	createdAt: iso(row.createdAt),
	editedAt: isoOrNull(row.editedAt),
	answeredAt: isoOrNull(row.answeredAt),
	attachments
});

async function withAttachments(db: Db, rows: Row[]): Promise<Message[]> {
	const ids = rows.map((row) => row.id);
	const linked = ids.length
		? await db
				.select({
					id: files.id,
					name: files.name,
					mime: files.mime,
					size: files.size,
					messageId: files.messageId
				})
				.from(files)
				.where(inArray(files.messageId, ids))
		: [];
	return rows.map((row) =>
		toMessage(
			row,
			linked.filter((f) => f.messageId === row.id).map(({ messageId: _, ...file }) => file)
		)
	);
}

export const drizzleMessages = (db: Db): MessageRepository => ({
	async get(id) {
		const rows = await db.select().from(messages).where(eq(messages.id, id));
		return (await withAttachments(db, rows))[0] ?? null;
	},
	async insert(message) {
		await db.insert(messages).values({
			...message,
			createdAt: new Date(message.createdAt),
			editedAt: null,
			answeredAt: null
		});
	},
	async save(message) {
		await db
			.update(messages)
			.set({
				body: message.body,
				editedAt: message.editedAt ? new Date(message.editedAt) : null,
				asks: message.asks,
				answeredAt: message.answeredAt ? new Date(message.answeredAt) : null
			})
			.where(eq(messages.id, message.id));
	},
	async delete(id) {
		await db.delete(messages).where(eq(messages.id, id));
	},
	async page(channelId, before, limit) {
		const rows = await db
			.select()
			.from(messages)
			.where(
				and(
					eq(messages.channelId, channelId),
					before ? lt(messages.createdAt, new Date(before)) : undefined
				)
			)
			.orderBy(desc(messages.createdAt))
			.limit(limit);
		return (await withAttachments(db, rows)).reverse();
	},
	async openQuestions(scope) {
		const rows = await db
			.select()
			.from(messages)
			.where(
				and(
					'channelId' in scope
						? eq(messages.channelId, scope.channelId)
						: inArray(messages.projectId, scope.projectIds),
					isNull(messages.answeredAt),
					sql`cardinality(${messages.asks}) > 0`
				)
			)
			.orderBy(asc(messages.createdAt))
			.limit(200);
		return withAttachments(db, rows);
	}
});
