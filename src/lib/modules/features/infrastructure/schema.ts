import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { elementPrimaryKey } from '../../elements/infrastructure/schema';
import { users } from '../../identity/infrastructure/schema';
import { projects } from '../../projects/infrastructure/schema';
import type { Moscow } from '../domain/feature';

export const features = pgTable('features', {
	id: elementPrimaryKey(),
	projectId: uuid()
		.notNull()
		.references(() => projects.id, { onDelete: 'cascade' }),
	description: text().notNull().default(''),
	priority: text().$type<Moscow>().notNull(),
	ownerId: uuid().references(() => users.id, { onDelete: 'set null' }),
	doneCriteria: text().notNull().default(''),
	archivedAt: timestamp({ withTimezone: true })
});
