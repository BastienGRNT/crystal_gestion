import { desc, eq } from 'drizzle-orm';
import { iso } from '$lib/server/db/columns';
import type { Db } from '$lib/server/db/types';
import type { StoredFile } from '../domain/file';
import type { FileRepository } from '../application/ports';
import { files } from './schema';

const toFile = (row: typeof files.$inferSelect): StoredFile => ({
	...row,
	createdAt: iso(row.createdAt)
});
const toRow = (file: StoredFile) => ({ ...file, createdAt: new Date(file.createdAt) });

export const drizzleFiles = (db: Db): FileRepository => ({
	list: async () => (await db.select().from(files).orderBy(desc(files.createdAt))).map(toFile),
	async get(id) {
		const [row] = await db.select().from(files).where(eq(files.id, id));
		return row ? toFile(row) : null;
	},
	async insert(file) {
		await db.insert(files).values(toRow(file));
	},
	async save(file) {
		await db.update(files).set(toRow(file)).where(eq(files.id, file.id));
	},
	async delete(id) {
		await db.delete(files).where(eq(files.id, id));
	}
});
