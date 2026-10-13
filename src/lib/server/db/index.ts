import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from '../env';
import type { Db } from './types';

// Reused across dev hot reloads to avoid leaking connection pools.
const globalStore = globalThis as { __crystalSql?: postgres.Sql };
const sql = (globalStore.__crystalSql ??= postgres(config.databaseUrl(), { max: 10 }));

export const db: Db = drizzle(sql, { casing: 'snake_case' });
