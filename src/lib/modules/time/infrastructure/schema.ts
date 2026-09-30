import { index, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { timestamptz } from '../../../server/db/columns';
import { users } from '../../identity/infrastructure/schema';
import { projects } from '../../projects/infrastructure/schema';
import { tasks } from '../../tasks/infrastructure/schema';
import type { TimeSource } from '../domain/time-entry';

export const timeEntries = pgTable(
	'time_entries',
	{
		id: uuid().primaryKey().defaultRandom(),
		projectId: uuid()
			.notNull()
			.references(() => projects.id, { onDelete: 'cascade' }),
		userId: uuid()
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		taskId: uuid().references(() => tasks.id, { onDelete: 'set null' }),
		startedAt: timestamptz().notNull(),
		endedAt: timestamptz(),
		source: text().$type<TimeSource>().notNull()
	},
	(table) => [index().on(table.projectId), index().on(table.userId, table.endedAt)]
);
