import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { createdAt, timestamptz } from '../../../server/db/columns';
import { users } from '../../identity/infrastructure/schema';
import { projects } from '../../projects/infrastructure/schema';
import type { NoteSource } from '../domain/ai-note';

export const aiNotes = pgTable('ai_notes', {
	id: uuid().primaryKey().defaultRandom(),
	projectId: uuid()
		.notNull()
		.references(() => projects.id, { onDelete: 'cascade' }),
	content: text().notNull(),
	source: text().$type<NoteSource>().notNull(),
	createdBy: uuid().references(() => users.id, { onDelete: 'set null' }),
	createdAt: createdAt(),
	updatedAt: timestamptz().notNull().defaultNow()
});
