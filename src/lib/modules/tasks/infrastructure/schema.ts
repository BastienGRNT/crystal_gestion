import {
	date,
	doublePrecision,
	index,
	integer,
	jsonb,
	pgTable,
	text,
	unique,
	uuid
} from 'drizzle-orm/pg-core';
import { createdAt, timestamptz } from '../../../server/db/columns';
import { users } from '../../identity/infrastructure/schema';
import { projects } from '../../projects/infrastructure/schema';
import { QUADRANTS, TASK_STATUSES, type ChecklistItem } from '../domain/task';

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
		reviewerId: uuid().references(() => users.id, { onDelete: 'set null' }),
		blockedReason: text(),
		checklist: jsonb().$type<ChecklistItem[]>().notNull().default([]),
		dueDate: date(),
		// No foreign key: the roadmap module owns steps and detaches their tasks before deleting one.
		milestoneId: uuid(),
		position: doublePrecision().notNull(),
		createdBy: uuid()
			.notNull()
			.references(() => users.id),
		createdAt: createdAt(),
		updatedAt: timestamptz().notNull(),
		statusChangedAt: timestamptz().notNull(),
		completedAt: timestamptz()
	},
	(t) => [unique().on(t.projectId, t.number), index().on(t.projectId), index().on(t.milestoneId)]
);

export const taskCounters = pgTable('task_counters', {
	projectId: uuid()
		.primaryKey()
		.references(() => projects.id, { onDelete: 'cascade' }),
	last: integer().notNull()
});
