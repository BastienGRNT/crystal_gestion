// Plain JS on purpose: runs in the production image (compose « migrate » service), where drizzle-kit
// isn't installed. Same bookkeeping table as `drizzle-kit migrate`, so both can apply drizzle/.
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is not set');

const sql = postgres(url, { max: 1, onnotice: () => {} });
try {
	await migrate(drizzle(sql), { migrationsFolder: './drizzle' });
	console.log('[migrate] database is up to date');
} finally {
	await sql.end();
}
