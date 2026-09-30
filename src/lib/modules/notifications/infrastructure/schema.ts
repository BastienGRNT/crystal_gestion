import { index, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { createdAt, timestamptz } from '../../../server/db/columns';
import { elements } from '../../elements/infrastructure/schema';
import { users } from '../../identity/infrastructure/schema';
import type { NotificationType } from '../../kernel/application/ports';
import type { ElementKind } from '../../kernel/domain/element';
import { projects } from '../../projects/infrastructure/schema';

const userId = () =>
	uuid()
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' });

export const notifications = pgTable(
	'notifications',
	{
		id: uuid().primaryKey().defaultRandom(),
		userId: userId(),
		projectId: uuid()
			.notNull()
			.references(() => projects.id, { onDelete: 'cascade' }),
		type: text().$type<NotificationType>().notNull(),
		actorId: userId(),
		elementId: uuid().references(() => elements.id, { onDelete: 'set null' }),
		elementRef: text().notNull(),
		elementKind: text().$type<ElementKind>().notNull(),
		elementTitle: text().notNull(),
		readAt: timestamptz(),
		createdAt: createdAt()
	},
	(table) => [index().on(table.userId, table.projectId, table.createdAt)]
);
