import { index, integer, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { createdAt, timestamptz } from '../../../server/db/columns';
import { WORK_STATUSES } from '../domain/user';

export const users = pgTable('users', {
	id: uuid().primaryKey(),
	email: text().notNull().unique(),
	name: text().notNull(),
	passwordHash: text().notNull(),
	color: integer().notNull().default(0),
	status: text({ enum: WORK_STATUSES }).notNull().default('available'),
	statusNote: text(),
	lastSeenAt: timestamptz(),
	createdAt: createdAt()
});

export const sessions = pgTable(
	'sessions',
	{
		tokenHash: text().primaryKey(),
		userId: uuid()
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		expiresAt: timestamptz().notNull(),
		createdAt: createdAt()
	},
	(t) => [index().on(t.userId)]
);

export const invitations = pgTable('invitations', {
	tokenHash: text().primaryKey(),
	createdBy: uuid()
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: timestamptz().notNull(),
	usedAt: timestamptz(),
	usedBy: uuid().references(() => users.id, { onDelete: 'set null' }),
	createdAt: createdAt()
});
