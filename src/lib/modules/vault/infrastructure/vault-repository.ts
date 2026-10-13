import { asc, eq } from 'drizzle-orm';
import { iso } from '$lib/server/db/columns';
import type { Db } from '$lib/server/db/types';
import type { VaultEntry } from '../domain/entry';
import type { VaultRepository } from '../application/ports';
import { vaultEntries } from './schema';

const toEntry = ({ secretCipher, ...row }: typeof vaultEntries.$inferSelect): VaultEntry => ({
	...row,
	hasSecret: secretCipher !== null,
	createdAt: iso(row.createdAt),
	updatedAt: iso(row.updatedAt)
});

const toRow = ({ hasSecret: _, ...entry }: VaultEntry) => ({
	...entry,
	createdAt: new Date(entry.createdAt),
	updatedAt: new Date(entry.updatedAt)
});

export const drizzleVault = (db: Db): VaultRepository => ({
	list: async () =>
		(await db.select().from(vaultEntries).orderBy(asc(vaultEntries.name))).map(toEntry),
	async get(id) {
		const [row] = await db.select().from(vaultEntries).where(eq(vaultEntries.id, id));
		return row ? { entry: toEntry(row), cipher: row.secretCipher } : null;
	},
	async insert(entry, secretCipher) {
		await db.insert(vaultEntries).values({ ...toRow(entry), secretCipher });
	},
	async save(entry, secretCipher) {
		const values = secretCipher === undefined ? toRow(entry) : { ...toRow(entry), secretCipher };
		await db.update(vaultEntries).set(values).where(eq(vaultEntries.id, entry.id));
	},
	async delete(id) {
		await db.delete(vaultEntries).where(eq(vaultEntries.id, id));
	}
});
