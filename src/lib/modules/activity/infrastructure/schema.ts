import { index, jsonb, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { createdAt, timestamptz } from '../../../server/db/columns';
import type { Subject } from '../../kernel/domain/subject';
import { users } from '../../identity/infrastructure/schema';

export const activities = pgTable(
	'activities',
	{
		id: uuid().primaryKey(),
		actorId: uuid()
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		verb: text().notNull(),
		subject: jsonb().$type<Subject>().notNull(),
		createdAt: createdAt()
	},
	(t) => [index().on(t.createdAt)]
);

export const notifications = pgTable(
	'notifications',
	{
		id: uuid().primaryKey(),
		userId: uuid()
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		actorId: uuid()
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		kind: text({ enum: ['assigned', 'mention'] }).notNull(),
		subject: jsonb().$type<Subject>().notNull(),
		createdAt: createdAt(),
		readAt: timestamptz()
	},
	(t) => [index().on(t.userId, t.createdAt)]
);
