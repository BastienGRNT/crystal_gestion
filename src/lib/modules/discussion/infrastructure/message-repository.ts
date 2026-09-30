import { and, eq, isNull } from 'drizzle-orm';
import { isoOrNull, type Executor } from '$lib/server/db/types';
import { drizzleElementStore } from '../../elements/infrastructure/element-store';
import type { MessageRepository } from '../application/ports';
import type { Message } from '../domain/message';
import { messages } from './schema';

type Fields = Omit<Message, 'id' | 'ref' | 'kind' | 'projectId' | 'createdAt' | 'editedAt'>;

export function drizzleMessageRepository(db: Executor): MessageRepository {
	const store = drizzleElementStore<typeof messages, Message, Fields>(db, {
		table: messages,
		kind: () => 'message',
		titleOf: (fields) => fields.title,
		toRow: ({ title: _title, ...fields }) => fields,
		toElement: (row, meta) => ({
			...row,
			kind: 'message',
			ref: meta.ref,
			title: meta.title,
			createdAt: meta.createdAt,
			editedAt: isoOrNull(row.editedAt)
		})
	});
	return {
		create: ({ projectId, ...fields }) =>
			store.create({ ...fields, projectId, createdBy: fields.authorId }),
		update: async (projectId, id, changes) => {
			if (changes.body !== undefined)
				await db.update(messages).set({ editedAt: new Date() }).where(eq(messages.id, id));
			return store.update(projectId, id, changes);
		},
		find: store.find,
		delete: store.delete,
		listThread: async (projectId, featureId, limit) => {
			const thread = featureId ? eq(messages.featureId, featureId) : isNull(messages.featureId);
			const newest = await store.query(and(eq(messages.projectId, projectId), thread), {
				newestFirst: true,
				limit
			});
			return newest.reverse();
		}
	};
}
