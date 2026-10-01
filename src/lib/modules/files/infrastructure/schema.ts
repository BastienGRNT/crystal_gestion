import { bigint, pgTable, text, uuid, type AnyPgColumn } from 'drizzle-orm/pg-core';
import { createdAt } from '../../../server/db/columns';
import { elementPrimaryKey } from '../../elements/infrastructure/schema';
import { features } from '../../features/infrastructure/schema';
import { projects } from '../../projects/infrastructure/schema';

/** A deleted feature leaves its sub-folders in place, moved to « Général » like its files. */
export const folders = pgTable('folders', {
	id: uuid().primaryKey().defaultRandom(),
	projectId: uuid()
		.notNull()
		.references(() => projects.id, { onDelete: 'cascade' }),
	featureId: uuid().references(() => features.id, { onDelete: 'set null' }),
	parentId: uuid().references((): AnyPgColumn => folders.id, { onDelete: 'cascade' }),
	name: text().notNull(),
	createdAt: createdAt()
});

export const files = pgTable('files', {
	id: elementPrimaryKey(),
	projectId: uuid()
		.notNull()
		.references(() => projects.id, { onDelete: 'cascade' }),
	featureId: uuid().references(() => features.id, { onDelete: 'set null' }),
	folderId: uuid().references(() => folders.id, { onDelete: 'set null' }),
	mimeType: text().notNull(),
	size: bigint({ mode: 'number' }).notNull(),
	storageKey: text().notNull()
});
