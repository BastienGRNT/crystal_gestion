import { bigint, index, pgTable, text, uuid, type AnyPgColumn } from 'drizzle-orm/pg-core';
import { createdAt } from '../../../server/db/columns';
import { messages } from '../../chat/infrastructure/schema';
import { users } from '../../identity/infrastructure/schema';
import { projects } from '../../projects/infrastructure/schema';

export const folders = pgTable(
	'folders',
	{
		id: uuid().primaryKey(),
		projectId: uuid()
			.notNull()
			.references(() => projects.id, { onDelete: 'cascade' }),
		parentId: uuid().references((): AnyPgColumn => folders.id, { onDelete: 'cascade' }),
		name: text().notNull(),
		system: text({ enum: ['chat'] }),
		createdBy: uuid()
			.notNull()
			.references(() => users.id),
		createdAt: createdAt()
	},
	(t) => [index().on(t.projectId)]
);

export const files = pgTable(
	'files',
	{
		id: uuid().primaryKey(),
		projectId: uuid()
			.notNull()
			.references(() => projects.id, { onDelete: 'cascade' }),
		folderId: uuid().references(() => folders.id, { onDelete: 'set null' }),
		name: text().notNull(),
		mime: text().notNull(),
		size: bigint({ mode: 'number' }).notNull(),
		uploadedBy: uuid()
			.notNull()
			.references(() => users.id),
		createdAt: createdAt(),
		messageId: uuid().references(() => messages.id, { onDelete: 'set null' })
	},
	(t) => [index().on(t.projectId), index().on(t.folderId), index().on(t.messageId)]
);
