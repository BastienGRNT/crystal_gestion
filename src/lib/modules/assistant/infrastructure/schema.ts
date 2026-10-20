import { bigint, index, integer, jsonb, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { createdAt } from '../../../server/db/columns';
import { users } from '../../identity/infrastructure/schema';
import { projects } from '../../projects/infrastructure/schema';
import type { Proposal } from '../domain/proposal';

/** Every paid ask to the assistant: what it cost, and the proposal (the cache). */
export const aiUsage = pgTable(
	'ai_usage',
	{
		id: uuid().primaryKey(),
		projectId: uuid()
			.notNull()
			.references(() => projects.id, { onDelete: 'cascade' }),
		userId: uuid()
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		action: text().notNull(),
		model: text().notNull(),
		fingerprint: text().notNull(),
		inputTokens: integer().notNull(),
		outputTokens: integer().notNull(),
		cacheWriteTokens: integer().notNull(),
		cacheReadTokens: integer().notNull(),
		costMicros: bigint({ mode: 'number' }).notNull(),
		proposal: jsonb().$type<Proposal>().notNull(),
		createdAt: createdAt()
	},
	(t) => [index().on(t.projectId, t.createdAt), index().on(t.fingerprint)]
);
