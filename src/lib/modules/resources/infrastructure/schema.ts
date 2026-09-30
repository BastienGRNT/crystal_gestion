import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { elementPrimaryKey } from '../../elements/infrastructure/schema';
import { features } from '../../features/infrastructure/schema';
import { projects } from '../../projects/infrastructure/schema';

const projectId = () =>
	uuid()
		.notNull()
		.references(() => projects.id, { onDelete: 'cascade' });
const featureId = () => uuid().references(() => features.id, { onDelete: 'set null' });
const optional = () => text().notNull().default('');

export const accounts = pgTable('accounts', {
	id: elementPrimaryKey(),
	projectId: projectId(),
	login: optional(),
	secret: optional(),
	url: optional(),
	notes: optional(),
	featureId: featureId()
});

export const resourceLinks = pgTable('resource_links', {
	id: elementPrimaryKey(),
	projectId: projectId(),
	url: optional(),
	tag: optional(),
	featureId: featureId()
});

export const contacts = pgTable('contacts', {
	id: elementPrimaryKey(),
	projectId: projectId(),
	role: optional(),
	email: optional(),
	phone: optional(),
	notes: optional()
});
