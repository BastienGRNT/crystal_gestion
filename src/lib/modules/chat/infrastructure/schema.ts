import { sql } from 'drizzle-orm';
import { index, pgTable, primaryKey, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { createdAt, timestamptz } from '../../../server/db/columns';
import { users } from '../../identity/infrastructure/schema';
import { projects } from '../../projects/infrastructure/schema';

export const channels = pgTable(
	'channels',
	{
		id: uuid().primaryKey(),
		kind: text({ enum: ['general', 'project', 'topic'] }).notNull(),
		name: text().notNull(),
		projectId: uuid()
			.unique()
			.references(() => projects.id, { onDelete: 'cascade' }),
		createdBy: uuid().references(() => users.id, { onDelete: 'set null' }),
		createdAt: createdAt()
	},
	(t) => [
		uniqueIndex('channels_single_general')
			.on(t.kind)
			.where(sql`${t.kind} = 'general'`)
	]
);

export const messages = pgTable(
	'messages',
	{
		id: uuid().primaryKey(),
		channelId: uuid()
			.notNull()
			.references(() => channels.id, { onDelete: 'cascade' }),
		authorId: uuid()
			.notNull()
			.references(() => users.id),
		body: text().notNull(),
		createdAt: createdAt(),
		editedAt: timestamptz()
	},
	(t) => [index().on(t.channelId, t.createdAt)]
);

export const channelReads = pgTable(
	'channel_reads',
	{
		userId: uuid()
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		channelId: uuid()
			.notNull()
			.references(() => channels.id, { onDelete: 'cascade' }),
		lastReadAt: timestamptz().notNull()
	},
	(t) => [primaryKey({ columns: [t.userId, t.channelId] })]
);
