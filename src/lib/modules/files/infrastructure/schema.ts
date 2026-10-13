import { bigint, index, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { createdAt } from '../../../server/db/columns';
import { messages } from '../../chat/infrastructure/schema';
import { users } from '../../identity/infrastructure/schema';
import { projects } from '../../projects/infrastructure/schema';

export const files = pgTable(
	'files',
	{
		id: uuid().primaryKey(),
		projectId: uuid().references(() => projects.id, { onDelete: 'cascade' }),
		name: text().notNull(),
		mime: text().notNull(),
		size: bigint({ mode: 'number' }).notNull(),
		uploadedBy: uuid()
			.notNull()
			.references(() => users.id),
		createdAt: createdAt(),
		messageId: uuid().references(() => messages.id, { onDelete: 'set null' })
	},
	(t) => [index().on(t.projectId), index().on(t.messageId)]
);
