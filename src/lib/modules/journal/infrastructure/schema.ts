import { jsonb, pgTable, uuid } from 'drizzle-orm/pg-core';
import { elementPrimaryKey } from '../../elements/infrastructure/schema';
import { features } from '../../features/infrastructure/schema';
import { projects } from '../../projects/infrastructure/schema';
import type { JournalDetails } from '../domain/journal-entry';

export const journalEntries = pgTable('journal_entries', {
	id: elementPrimaryKey(),
	projectId: uuid()
		.notNull()
		.references(() => projects.id, { onDelete: 'cascade' }),
	featureId: uuid().references(() => features.id, { onDelete: 'set null' }),
	details: jsonb().$type<JournalDetails>().notNull()
});
