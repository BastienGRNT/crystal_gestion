import { boolean, pgTable, primaryKey, text, uuid, type AnyPgColumn } from 'drizzle-orm/pg-core';
import { timestamptz } from '../../../server/db/columns';
import { elementPrimaryKey } from '../../elements/infrastructure/schema';
import { features } from '../../features/infrastructure/schema';
import { users } from '../../identity/infrastructure/schema';
import { projects } from '../../projects/infrastructure/schema';

export const messages = pgTable('messages', {
	id: elementPrimaryKey(),
	projectId: uuid()
		.notNull()
		.references(() => projects.id, { onDelete: 'cascade' }),
	featureId: uuid().references(() => features.id, { onDelete: 'set null' }),
	authorId: uuid()
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	body: text().notNull(),
	replyToId: uuid().references((): AnyPgColumn => messages.id, { onDelete: 'set null' }),
	isQuestion: boolean().notNull().default(false),
	mentionIds: uuid().array().notNull().default([]),
	editedAt: timestamptz()
});

export const questionTargets = pgTable(
	'question_targets',
	{
		projectId: uuid()
			.notNull()
			.references(() => projects.id, { onDelete: 'cascade' }),
		messageId: uuid()
			.notNull()
			.references(() => messages.id, { onDelete: 'cascade' }),
		userId: uuid()
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		resolvedAt: timestamptz()
	},
	(table) => [primaryKey({ columns: [table.messageId, table.userId] })]
);
