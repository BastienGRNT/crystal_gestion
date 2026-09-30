import type { ExtractTablesWithRelations } from 'drizzle-orm';
import type { PgDatabase } from 'drizzle-orm/pg-core';
import type { PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js';
import type * as schema from './schema';

type Schema = typeof schema;

/** Accepts both the root database and a transaction. */
export type Executor = PgDatabase<
	PostgresJsQueryResultHKT,
	Schema,
	ExtractTablesWithRelations<Schema>
>;

/** Keeps `undefined` (column untouched) distinct from `null` (column cleared). */
export const parseOptionalDate = (value: string | null | undefined) =>
	value === undefined ? undefined : value === null ? null : new Date(value);

export const isoOrNull = (date: Date | null) => (date ? date.toISOString() : null);
