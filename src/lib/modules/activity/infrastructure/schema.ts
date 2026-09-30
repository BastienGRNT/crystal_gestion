import { index, jsonb, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { createdAt } from '../../../server/db/columns';
import { elements } from '../../elements/infrastructure/schema';
import { users } from '../../identity/infrastructure/schema';
import type { ActivityVerb } from '../../kernel/application/ports';
import type { ElementKind } from '../../kernel/domain/element';
import { projects } from '../../projects/infrastructure/schema';

export const activities = pgTable(
	'activities',
	{
		id: uuid().primaryKey().defaultRandom(),
		projectId: uuid()
			.notNull()
			.references(() => projects.id, { onDelete: 'cascade' }),
		actorId: uuid()
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		verb: text().$type<ActivityVerb>().notNull(),
		elementId: uuid().references(() => elements.id, { onDelete: 'set null' }),
		elementRef: text().notNull(),
		elementKind: text().$type<ElementKind>().notNull(),
		elementTitle: text().notNull(),
		details: jsonb().$type<Record<string, string>>().notNull().default({}),
		createdAt: createdAt()
	},
	(table) => [index().on(table.projectId, table.createdAt)]
);
