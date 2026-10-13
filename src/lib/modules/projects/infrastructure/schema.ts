import { date, integer, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { createdAt, timestamptz } from '../../../server/db/columns';
import { users } from '../../identity/infrastructure/schema';

export const projects = pgTable('projects', {
	id: uuid().primaryKey(),
	slug: text().notNull().unique(),
	name: text().notNull(),
	description: text().notNull().default(''),
	color: integer().notNull().default(0),
	deadline: date(),
	archivedAt: timestamptz(),
	createdBy: uuid()
		.notNull()
		.references(() => users.id),
	createdAt: createdAt()
});
