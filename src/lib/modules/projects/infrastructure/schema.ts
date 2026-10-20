import {
	date,
	doublePrecision,
	index,
	integer,
	jsonb,
	pgTable,
	primaryKey,
	text,
	uuid
} from 'drizzle-orm/pg-core';
import { createdAt, timestamptz } from '../../../server/db/columns';
import { users } from '../../identity/infrastructure/schema';
import { PROJECT_KINDS } from '../domain/project';

export const projects = pgTable('projects', {
	id: uuid().primaryKey(),
	slug: text().notNull().unique(),
	name: text().notNull(),
	description: text().notNull().default(''),
	color: integer().notNull().default(0),
	kind: text({ enum: PROJECT_KINDS }).notNull().default('product'),
	deadline: date(),
	weekGoal: text().notNull().default(''),
	brief: text().notNull().default(''),
	techSpec: text().notNull().default(''),
	soldDays: doublePrecision(),
	shipChecklist: jsonb().$type<string[]>().notNull().default([]),
	archivedAt: timestamptz(),
	createdBy: uuid()
		.notNull()
		.references(() => users.id),
	createdAt: createdAt()
});

export const projectMembers = pgTable(
	'project_members',
	{
		projectId: uuid()
			.notNull()
			.references(() => projects.id, { onDelete: 'cascade' }),
		userId: uuid()
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		role: text({ enum: ['owner', 'member'] }).notNull(),
		joinedAt: createdAt()
	},
	(t) => [primaryKey({ columns: [t.projectId, t.userId] }), index().on(t.userId)]
);

export const projectInvitations = pgTable('project_invitations', {
	tokenHash: text().primaryKey(),
	projectId: uuid()
		.notNull()
		.references(() => projects.id, { onDelete: 'cascade' }),
	createdBy: uuid()
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: timestamptz().notNull(),
	usedAt: timestamptz(),
	usedBy: uuid().references(() => users.id, { onDelete: 'set null' }),
	createdAt: createdAt()
});
