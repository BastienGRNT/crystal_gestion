import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '$env/dynamic/private';
import * as schema from './schema';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

// Reused across dev hot reloads to avoid leaking connection pools.
const globalStore = globalThis as { __crystalSql?: postgres.Sql };
const sql = (globalStore.__crystalSql ??= postgres(env.DATABASE_URL));

export const db = drizzle(sql, { schema, casing: 'snake_case' });
