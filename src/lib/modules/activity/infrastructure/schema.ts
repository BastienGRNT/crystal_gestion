import { index, jsonb, pgTable, primaryKey, text, uuid } from 'drizzle-orm/pg-core';
import { createdAt, timestamptz } from '../../../server/db/columns';
import type { Subject } from '../../kernel/domain/subject';
import { users } from '../../identity/infrastructure/schema';
import { projects } from '../../projects/infrastructure/schema';

export const activities = pgTable(
	'activities',
	{
		id: uuid().primaryKey(),
		projectId: uuid()
			.notNull()
			.references(() => projects.id, { onDelete: 'cascade' }),
		actorId: uuid()
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		verb: text().notNull(),
		subject: jsonb().$type<Subject>().notNull(),
		createdAt: createdAt()
	},
	(t) => [index().on(t.projectId, t.createdAt)]
);

export const notifications = pgTable(
	'notifications',
	{
		id: uuid().primaryKey(),
		userId: uuid()
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		projectId: uuid()
			.notNull()
			.references(() => projects.id, { onDelete: 'cascade' }),
		actorId: uuid()
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		kind: text({ enum: ['assigned', 'mention', 'review'] }).notNull(),
		subject: jsonb().$type<Subject>().notNull(),
		createdAt: createdAt(),
		readAt: timestamptz()
	},
	(t) => [index().on(t.userId, t.createdAt)]
);

export const projectVisits = pgTable(
	'project_visits',
	{
		userId: uuid()
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		projectId: uuid()
			.notNull()
			.references(() => projects.id, { onDelete: 'cascade' }),
		seenAt: timestamptz().notNull()
	},
	(t) => [primaryKey({ columns: [t.userId, t.projectId] })]
);
