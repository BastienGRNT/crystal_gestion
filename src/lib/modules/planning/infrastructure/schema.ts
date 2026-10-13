import { index, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { timestamptz } from '../../../server/db/columns';
import { users } from '../../identity/infrastructure/schema';
import { projects } from '../../projects/infrastructure/schema';
import { tasks } from '../../tasks/infrastructure/schema';

export const availabilitySlots = pgTable(
	'availability_slots',
	{
		id: uuid().primaryKey(),
		userId: uuid()
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		startsAt: timestamptz().notNull(),
		endsAt: timestamptz().notNull(),
		status: text({ enum: ['available', 'maybe'] }).notNull()
	},
	(t) => [index().on(t.userId, t.startsAt)]
);

export const workBlocks = pgTable(
	'work_blocks',
	{
		id: uuid().primaryKey(),
		projectId: uuid()
			.notNull()
			.references(() => projects.id, { onDelete: 'cascade' }),
		userId: uuid()
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		taskId: uuid().references(() => tasks.id, { onDelete: 'set null' }),
		startsAt: timestamptz().notNull(),
		endsAt: timestamptz().notNull()
	},
	(t) => [index().on(t.projectId, t.startsAt)]
);
