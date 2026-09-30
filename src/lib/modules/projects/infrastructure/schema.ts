import { date, pgTable, primaryKey, text, uuid } from 'drizzle-orm/pg-core';
import { createdAt, timestamptz } from '../../../server/db/columns';
import { users } from '../../identity/infrastructure/schema';

export const projects = pgTable('projects', {
	id: uuid().primaryKey().defaultRandom(),
	slug: text().notNull().unique(),
	name: text().notNull(),
	objective: text().notNull().default(''),
	audience: text().notNull().default(''),
	deadline: date({ mode: 'string' }),
	outOfScope: text().notNull().default(''),
	doneDefinition: text().notNull().default(''),
	createdBy: uuid().references(() => users.id, { onDelete: 'set null' }),
	createdAt: createdAt()
});

const projectId = () =>
	uuid()
		.notNull()
		.references(() => projects.id, { onDelete: 'cascade' });

export const projectMembers = pgTable(
	'project_members',
	{
		projectId: projectId(),
		userId: uuid()
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		role: text().$type<'owner' | 'member'>().notNull(),
		joinedAt: createdAt(),
		lastSeenAt: timestamptz(),
		recapSince: timestamptz()
	},
	(table) => [primaryKey({ columns: [table.projectId, table.userId] })]
);

export const invitations = pgTable('invitations', {
	id: uuid().primaryKey().defaultRandom(),
	tokenHash: text().notNull().unique(),
	projectId: projectId(),
	invitedBy: uuid().references(() => users.id, { onDelete: 'set null' }),
	expiresAt: timestamptz().notNull(),
	acceptedBy: uuid().references(() => users.id, { onDelete: 'set null' }),
	acceptedAt: timestamptz(),
	createdAt: createdAt()
});
