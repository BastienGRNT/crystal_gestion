import {
	date,
	doublePrecision,
	index,
	integer,
	pgTable,
	text,
	unique,
	uuid
} from 'drizzle-orm/pg-core';
import { createdAt, timestamptz } from '../../../server/db/columns';
import { users } from '../../identity/infrastructure/schema';
import { projects } from '../../projects/infrastructure/schema';
import { QUADRANTS, TASK_STATUSES } from '../domain/task';

export const tasks = pgTable(
	'tasks',
	{
		id: uuid().primaryKey(),
		projectId: uuid()
			.notNull()
			.references(() => projects.id, { onDelete: 'cascade' }),
		number: integer().notNull(),
		title: text().notNull(),
		notes: text().notNull().default(''),
		status: text({ enum: TASK_STATUSES }).notNull(),
		quadrant: text({ enum: QUADRANTS }),
		assigneeId: uuid().references(() => users.id, { onDelete: 'set null' }),
		dueDate: date(),
		position: doublePrecision().notNull(),
		createdBy: uuid()
			.notNull()
			.references(() => users.id),
		createdAt: createdAt(),
		updatedAt: timestamptz().notNull(),
		completedAt: timestamptz()
	},
	(t) => [unique().on(t.projectId, t.number), index().on(t.projectId)]
);

export const taskCounters = pgTable('task_counters', {
	projectId: uuid()
		.primaryKey()
		.references(() => projects.id, { onDelete: 'cascade' }),
	last: integer().notNull()
});
