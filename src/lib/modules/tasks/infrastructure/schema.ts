import {
	boolean,
	date,
	doublePrecision,
	pgTable,
	primaryKey,
	text,
	uuid
} from 'drizzle-orm/pg-core';
import { timestamptz } from '../../../server/db/columns';
import { elementPrimaryKey } from '../../elements/infrastructure/schema';
import { features } from '../../features/infrastructure/schema';
import { users } from '../../identity/infrastructure/schema';
import { projects } from '../../projects/infrastructure/schema';
import type { TaskStatus } from '../domain/task';

export const tasks = pgTable('tasks', {
	id: elementPrimaryKey(),
	projectId: uuid()
		.notNull()
		.references(() => projects.id, { onDelete: 'cascade' }),
	description: text().notNull().default(''),
	featureId: uuid().references(() => features.id, { onDelete: 'set null' }),
	status: text().$type<TaskStatus>().notNull(),
	dueDate: date({ mode: 'string' }),
	important: boolean(),
	urgent: boolean(),
	position: doublePrecision().notNull(),
	isFix: boolean().notNull().default(false),
	completedAt: timestamptz()
});

export const taskAssignees = pgTable(
	'task_assignees',
	{
		taskId: uuid()
			.notNull()
			.references(() => tasks.id, { onDelete: 'cascade' }),
		userId: uuid()
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' })
	},
	(table) => [primaryKey({ columns: [table.taskId, table.userId] })]
);
