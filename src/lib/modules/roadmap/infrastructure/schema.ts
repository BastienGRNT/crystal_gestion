import {
	date,
	doublePrecision,
	index,
	pgTable,
	text,
	uuid,
	type AnyPgColumn
} from 'drizzle-orm/pg-core';
import { createdAt, timestamptz } from '../../../server/db/columns';
import { messages } from '../../chat/infrastructure/schema';
import { users } from '../../identity/infrastructure/schema';
import { projects } from '../../projects/infrastructure/schema';
import { tasks } from '../../tasks/infrastructure/schema';
import { DECISION_SOURCES } from '../domain/decision';
import { DIRECTIONS } from '../domain/metric';
import { VERDICTS } from '../domain/hypothesis';

const projectId = () =>
	uuid()
		.notNull()
		.references(() => projects.id, { onDelete: 'cascade' });

export const milestones = pgTable(
	'milestones',
	{
		id: uuid().primaryKey(),
		projectId: projectId(),
		title: text().notNull(),
		doneWhen: text().notNull().default(''),
		targetDate: date(),
		position: doublePrecision().notNull(),
		closedAt: timestamptz(),
		closedBy: uuid().references(() => users.id, { onDelete: 'set null' }),
		createdBy: uuid()
			.notNull()
			.references(() => users.id),
		createdAt: createdAt()
	},
	(t) => [index().on(t.projectId)]
);

export const hypotheses = pgTable(
	'hypotheses',
	{
		id: uuid().primaryKey(),
		projectId: projectId(),
		text: text().notNull(),
		taskId: uuid().references(() => tasks.id, { onDelete: 'set null' }),
		verdict: text({ enum: VERDICTS }).notNull(),
		createdBy: uuid()
			.notNull()
			.references(() => users.id),
		createdAt: createdAt()
	},
	(t) => [index().on(t.projectId)]
);

export const decisions = pgTable(
	'decisions',
	{
		id: uuid().primaryKey(),
		projectId: projectId(),
		text: text().notNull(),
		why: text().notNull().default(''),
		messageId: uuid().references(() => messages.id, { onDelete: 'set null' }),
		taskId: uuid().references(() => tasks.id, { onDelete: 'set null' }),
		milestoneId: uuid().references(() => milestones.id, { onDelete: 'set null' }),
		hypothesisId: uuid().references(() => hypotheses.id, { onDelete: 'set null' }),
		supersedes: uuid().references((): AnyPgColumn => decisions.id, { onDelete: 'set null' }),
		source: text({ enum: DECISION_SOURCES }).notNull().default('manual'),
		decidedBy: uuid()
			.notNull()
			.references(() => users.id),
		decidedAt: timestamptz().notNull()
	},
	(t) => [index().on(t.projectId)]
);

export const metrics = pgTable(
	'metrics',
	{
		id: uuid().primaryKey(),
		projectId: projectId(),
		name: text().notNull(),
		unit: text().notNull().default(''),
		target: doublePrecision(),
		direction: text({ enum: DIRECTIONS }).notNull().default('up'),
		position: doublePrecision().notNull(),
		archivedAt: timestamptz(),
		createdAt: createdAt()
	},
	(t) => [index().on(t.projectId)]
);

export const releases = pgTable(
	'releases',
	{
		id: uuid().primaryKey(),
		projectId: projectId(),
		name: text().notNull(),
		shippedAt: timestamptz().notNull(),
		changelog: text().notNull().default(''),
		notes: text().notNull().default(''),
		createdBy: uuid()
			.notNull()
			.references(() => users.id),
		createdAt: createdAt()
	},
	(t) => [index().on(t.projectId)]
);

export const metricReadings = pgTable(
	'metric_readings',
	{
		id: text().primaryKey(),
		metricId: uuid()
			.notNull()
			.references(() => metrics.id, { onDelete: 'cascade' }),
		projectId: projectId(),
		weekOf: date().notNull(),
		value: doublePrecision().notNull(),
		by: uuid()
			.notNull()
			.references(() => users.id),
		at: timestamptz().notNull()
	},
	(t) => [index().on(t.projectId)]
);
