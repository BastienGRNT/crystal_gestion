import { date, integer, jsonb, pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';
import { users } from '../../identity/infrastructure/schema';
import type { Slot } from '../domain/availability';

export const availabilityWeek = pgTable(
	'availability_week',
	{
		userId: uuid()
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		weekday: integer().notNull(),
		slots: jsonb().$type<Slot[]>().notNull()
	},
	(t) => [primaryKey({ columns: [t.userId, t.weekday] })]
);

export const availabilityDays = pgTable(
	'availability_days',
	{
		userId: uuid()
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		date: date().notNull(),
		slots: jsonb().$type<Slot[]>().notNull()
	},
	(t) => [primaryKey({ columns: [t.userId, t.date] })]
);
