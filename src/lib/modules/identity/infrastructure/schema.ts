import { jsonb, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { createdAt, timestamptz } from '../../../server/db/columns';
import type { UserPreferences } from '../domain/user';

export const users = pgTable('users', {
	id: uuid().primaryKey().defaultRandom(),
	email: text().notNull().unique(),
	name: text().notNull(),
	passwordHash: text().notNull(),
	color: text().notNull(),
	preferences: jsonb().$type<UserPreferences>().notNull().default({}),
	createdAt: createdAt()
});

export const sessions = pgTable('sessions', {
	id: text().primaryKey(),
	userId: uuid()
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: timestamptz().notNull()
});
