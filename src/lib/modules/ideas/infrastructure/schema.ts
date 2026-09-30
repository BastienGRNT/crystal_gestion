import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { timestamptz } from '../../../server/db/columns';
import { elementPrimaryKey } from '../../elements/infrastructure/schema';
import { features } from '../../features/infrastructure/schema';
import { projects } from '../../projects/infrastructure/schema';

export const ideas = pgTable('ideas', {
	id: elementPrimaryKey(),
	projectId: uuid()
		.notNull()
		.references(() => projects.id, { onDelete: 'cascade' }),
	note: text().notNull().default(''),
	featureId: uuid().references(() => features.id, { onDelete: 'set null' }),
	archivedAt: timestamptz(),
	triagedAt: timestamptz()
});
