import {
	boolean,
	doublePrecision,
	index,
	integer,
	jsonb,
	pgTable,
	text,
	unique,
	uuid
} from 'drizzle-orm/pg-core';
import { createdAt } from '../../../server/db/columns';
import { users } from '../../identity/infrastructure/schema';
import { projects } from '../../projects/infrastructure/schema';
import {
	INFORM_EVERY,
	LEVELS,
	STAKEHOLDER_ROLES,
	STRATEGY_KINDS,
	SWOT_QUADRANTS,
	TECH_LEVELS,
	type Criterion
} from '../domain/framing';

const projectId = () =>
	uuid()
		.notNull()
		.references(() => projects.id, { onDelete: 'cascade' });

// Links between framing items (and to metrics, modules, bets) have no foreign key: the use
// cases detach what points at an item before deleting it, and check the project on the way in.

export const initiatives = pgTable(
	'initiatives',
	{
		id: uuid().primaryKey(),
		projectId: projectId(),
		title: text().notNull(),
		why: text().notNull().default(''),
		metricId: uuid(),
		position: doublePrecision().notNull(),
		createdAt: createdAt()
	},
	(t) => [index().on(t.projectId)]
);

export const epics = pgTable(
	'epics',
	{
		id: uuid().primaryKey(),
		projectId: projectId(),
		initiativeId: uuid(),
		componentId: uuid(),
		title: text().notNull(),
		description: text().notNull().default(''),
		later: boolean().notNull().default(false),
		position: doublePrecision().notNull(),
		createdAt: createdAt()
	},
	(t) => [index().on(t.projectId)]
);

export const stories = pgTable(
	'stories',
	{
		id: uuid().primaryKey(),
		projectId: projectId(),
		number: integer().notNull(),
		epicId: uuid(),
		personaId: uuid(),
		want: text().notNull(),
		soThat: text().notNull().default(''),
		criteria: jsonb().$type<Criterion[]>().notNull().default([]),
		position: doublePrecision().notNull(),
		createdAt: createdAt()
	},
	(t) => [index().on(t.projectId), unique().on(t.projectId, t.number)]
);

export const storyCounters = pgTable('story_counters', {
	projectId: uuid()
		.primaryKey()
		.references(() => projects.id, { onDelete: 'cascade' }),
	last: integer().notNull()
});

export const stakeholders = pgTable(
	'stakeholders',
	{
		id: uuid().primaryKey(),
		projectId: projectId(),
		name: text().notNull(),
		organization: text().notNull().default(''),
		role: text({ enum: STAKEHOLDER_ROLES }).notNull(),
		influence: text({ enum: LEVELS }).notNull(),
		interest: text({ enum: LEVELS }).notNull(),
		expects: text().notNull().default(''),
		techLevel: text({ enum: TECH_LEVELS }),
		interactions: text().notNull().default(''),
		informEvery: text({ enum: INFORM_EVERY }),
		userId: uuid().references(() => users.id, { onDelete: 'set null' }),
		position: doublePrecision().notNull(),
		createdAt: createdAt()
	},
	(t) => [index().on(t.projectId)]
);

export const journeys = pgTable(
	'journeys',
	{
		id: uuid().primaryKey(),
		projectId: projectId(),
		title: text().notNull(),
		body: text().notNull().default(''),
		position: doublePrecision().notNull(),
		createdAt: createdAt()
	},
	(t) => [index().on(t.projectId)]
);

export const glossaryTerms = pgTable(
	'glossary_terms',
	{
		id: uuid().primaryKey(),
		projectId: projectId(),
		term: text().notNull(),
		definition: text().notNull().default(''),
		createdAt: createdAt()
	},
	(t) => [index().on(t.projectId)]
);

export const swotItems = pgTable(
	'swot_items',
	{
		id: uuid().primaryKey(),
		projectId: projectId(),
		quadrant: text({ enum: SWOT_QUADRANTS }).notNull(),
		text: text().notNull(),
		position: doublePrecision().notNull(),
		createdAt: createdAt()
	},
	(t) => [index().on(t.projectId)]
);

export const strategies = pgTable(
	'strategies',
	{
		id: uuid().primaryKey(),
		projectId: projectId(),
		kind: text({ enum: STRATEGY_KINDS }).notNull(),
		text: text().notNull(),
		itemIds: jsonb().$type<string[]>().notNull().default([]),
		epicId: uuid(),
		hypothesisId: uuid(),
		createdAt: createdAt()
	},
	(t) => [index().on(t.projectId)]
);
