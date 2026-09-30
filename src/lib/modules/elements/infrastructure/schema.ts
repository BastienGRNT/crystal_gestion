import { integer, pgTable, primaryKey, text, unique, uuid } from 'drizzle-orm/pg-core';
import { createdAt, timestamptz } from '../../../server/db/columns';
import { users } from '../../identity/infrastructure/schema';
import type { ElementKind } from '../../kernel/domain/element';
import { projects } from '../../projects/infrastructure/schema';

const projectId = () =>
	uuid()
		.notNull()
		.references(() => projects.id, { onDelete: 'cascade' });

export const elements = pgTable(
	'elements',
	{
		id: uuid().primaryKey().defaultRandom(),
		projectId: projectId(),
		kind: text().$type<ElementKind>().notNull(),
		prefix: text().notNull(),
		number: integer().notNull(),
		title: text().notNull(),
		status: text(),
		createdBy: uuid().references(() => users.id, { onDelete: 'set null' }),
		createdAt: createdAt(),
		updatedAt: timestamptz().notNull().defaultNow()
	},
	(table) => [unique().on(table.projectId, table.prefix, table.number)]
);

export const elementCounters = pgTable(
	'element_counters',
	{ projectId: projectId(), prefix: text().notNull(), value: integer().notNull() },
	(table) => [primaryKey({ columns: [table.projectId, table.prefix] })]
);

const elementId = () =>
	uuid()
		.notNull()
		.references(() => elements.id, { onDelete: 'cascade' });

export const elementReferences = pgTable(
	'element_references',
	{ projectId: projectId(), sourceId: elementId(), targetId: elementId() },
	(table) => [primaryKey({ columns: [table.sourceId, table.targetId] })]
);

/** Module tables share their primary key with `elements`, so deleting the element deletes the row. */
export const elementPrimaryKey = () =>
	uuid()
		.primaryKey()
		.references(() => elements.id, { onDelete: 'cascade' });
