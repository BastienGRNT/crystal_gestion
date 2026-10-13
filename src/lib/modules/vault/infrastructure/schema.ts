import { index, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { createdAt, timestamptz } from '../../../server/db/columns';
import { users } from '../../identity/infrastructure/schema';
import { projects } from '../../projects/infrastructure/schema';

export const vaultEntries = pgTable(
	'vault_entries',
	{
		id: uuid().primaryKey(),
		projectId: uuid()
			.notNull()
			.references(() => projects.id, { onDelete: 'cascade' }),
		name: text().notNull(),
		url: text(),
		username: text(),
		secretCipher: text(),
		notes: text().notNull().default(''),
		createdBy: uuid()
			.notNull()
			.references(() => users.id),
		createdAt: createdAt(),
		updatedAt: timestamptz().notNull()
	},
	(t) => [index().on(t.projectId)]
);
