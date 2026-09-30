import { bigint, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { elementPrimaryKey } from '../../elements/infrastructure/schema';
import { features } from '../../features/infrastructure/schema';
import { projects } from '../../projects/infrastructure/schema';

export const files = pgTable('files', {
	id: elementPrimaryKey(),
	projectId: uuid()
		.notNull()
		.references(() => projects.id, { onDelete: 'cascade' }),
	featureId: uuid().references(() => features.id, { onDelete: 'set null' }),
	mimeType: text().notNull(),
	size: bigint({ mode: 'number' }).notNull(),
	storageKey: text().notNull()
});
