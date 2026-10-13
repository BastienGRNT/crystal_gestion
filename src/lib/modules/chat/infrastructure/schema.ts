import { sql } from 'drizzle-orm';
import {
	index,
	pgTable,
	primaryKey,
	text,
	uniqueIndex,
	uuid,
	type AnyPgColumn
} from 'drizzle-orm/pg-core';
import { createdAt, timestamptz } from '../../../server/db/columns';
import { users } from '../../identity/infrastructure/schema';
import { projects } from '../../projects/infrastructure/schema';
import { tasks } from '../../tasks/infrastructure/schema';

export const channels = pgTable(
	'channels',
	{
		id: uuid().primaryKey(),
		projectId: uuid()
			.notNull()
			.references(() => projects.id, { onDelete: 'cascade' }),
		kind: text({ enum: ['general', 'custom', 'task'] }).notNull(),
		name: text().notNull(),
		taskId: uuid()
			.unique()
			.references(() => tasks.id, { onDelete: 'cascade' }),
		createdBy: uuid().references(() => users.id, { onDelete: 'set null' }),
		createdAt: createdAt()
	},
	(t) => [
		index().on(t.projectId),
		uniqueIndex('channels_one_general_per_project')
			.on(t.projectId)
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
		projectId: uuid()
			.notNull()
			.references(() => projects.id, { onDelete: 'cascade' }),
		authorId: uuid()
			.notNull()
			.references(() => users.id),
		body: text().notNull(),
		replyToId: uuid().references((): AnyPgColumn => messages.id, { onDelete: 'set null' }),
		createdAt: createdAt(),
		editedAt: timestamptz(),
		asks: uuid()
			.array()
			.notNull()
			.default(sql`'{}'::uuid[]`),
		answeredAt: timestamptz()
	},
	(t) => [
		index().on(t.channelId, t.createdAt),
		index('messages_open_questions')
			.on(t.projectId)
			.where(sql`${t.answeredAt} is null and cardinality(${t.asks}) > 0`)
	]
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
