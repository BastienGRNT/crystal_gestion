import { and, desc, eq, inArray } from 'drizzle-orm';
import { iso } from '$lib/server/db/columns';
import type { Db } from '$lib/server/db/types';
import type { StoredFile } from '../domain/file';
import type { Folder } from '../domain/folder';
import type { FileRepository, FolderRepository } from '../application/ports';
import { files, folders } from './schema';

const toFile = (row: typeof files.$inferSelect): StoredFile => ({
	...row,
	createdAt: iso(row.createdAt)
});
const toFolder = (row: typeof folders.$inferSelect): Folder => ({
	...row,
	createdAt: iso(row.createdAt)
});
const withDate = <T extends { createdAt: string }>(item: T) => ({
	...item,
	createdAt: new Date(item.createdAt)
});

export const drizzleFiles = (db: Db): FileRepository => ({
	ofProjects: async (ids) =>
		ids.length
			? (
					await db
						.select()
						.from(files)
						.where(inArray(files.projectId, ids))
						.orderBy(desc(files.createdAt))
				).map(toFile)
			: [],
	inFolders: async (ids) =>
		ids.length
			? (await db.select().from(files).where(inArray(files.folderId, ids))).map(toFile)
			: [],
	async get(id) {
		const [row] = await db.select().from(files).where(eq(files.id, id));
		return row ? toFile(row) : null;
	},
	async insert(file) {
		await db.insert(files).values(withDate(file));
	},
	async save(file) {
		await db.update(files).set(withDate(file)).where(eq(files.id, file.id));
	},
	async delete(id) {
		await db.delete(files).where(eq(files.id, id));
	}
});

export const drizzleFolders = (db: Db): FolderRepository => ({
	ofProjects: async (ids) =>
		ids.length
			? (await db.select().from(folders).where(inArray(folders.projectId, ids))).map(toFolder)
			: [],
	async get(id) {
		const [row] = await db.select().from(folders).where(eq(folders.id, id));
		return row ? toFolder(row) : null;
	},
	async chatFolder(projectId) {
		const [row] = await db
			.select()
			.from(folders)
			.where(and(eq(folders.projectId, projectId), eq(folders.system, 'chat')));
		return row ? toFolder(row) : null;
	},
	async insert(folder) {
		await db.insert(folders).values(withDate(folder));
	},
	async save(folder) {
		await db.update(folders).set(withDate(folder)).where(eq(folders.id, folder.id));
	},
	async delete(id) {
		await db.delete(folders).where(eq(folders.id, id));
	}
});
