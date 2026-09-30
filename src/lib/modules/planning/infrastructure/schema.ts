import { index, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { timestamptz } from '../../../server/db/columns';
import { users } from '../../identity/infrastructure/schema';
import type { AvailabilityStatus } from '../domain/availability';

export const availabilities = pgTable(
	'availabilities',
	{
		id: uuid().primaryKey().defaultRandom(),
		userId: uuid()
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		startsAt: timestamptz().notNull(),
		endsAt: timestamptz().notNull(),
		status: text().$type<AvailabilityStatus>().notNull()
	},
	(table) => [index().on(table.userId, table.startsAt)]
);
