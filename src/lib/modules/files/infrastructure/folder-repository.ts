import { and, asc, eq } from 'drizzle-orm';
import type { Executor } from '$lib/server/db/types';
import type { FolderRepository } from '../application/ports';
import type { Folder } from '../domain/folder';
import { files, folders } from './schema';

const toFolder = (row: typeof folders.$inferSelect): Folder => ({
	...row,
	createdAt: row.createdAt.toISOString()
});

export const drizzleFolderRepository = (db: Executor): FolderRepository => {
	const owned = (projectId: string, id: string) =>
		and(eq(folders.projectId, projectId), eq(folders.id, id));
	return {
		create: async (folder) => toFolder((await db.insert(folders).values(folder).returning())[0]),
		rename: async (projectId, id, name) => {
			const [row] = await db.update(folders).set({ name }).where(owned(projectId, id)).returning();
			return row ? toFolder(row) : null;
		},
		delete: async (projectId, id) =>
			(await db.delete(folders).where(owned(projectId, id)).returning()).length > 0,
		find: async (projectId, id) => {
			const [row] = await db.select().from(folders).where(owned(projectId, id));
			return row ? toFolder(row) : null;
		},
		list: async (projectId) =>
			(
				await db
					.select()
					.from(folders)
					.where(eq(folders.projectId, projectId))
					.orderBy(asc(folders.name))
			).map(toFolder),
		isEmpty: async (id) => {
			const [file] = await db
				.select({ id: files.id })
				.from(files)
				.where(eq(files.folderId, id))
				.limit(1);
			const [child] = await db
				.select({ id: folders.id })
				.from(folders)
				.where(eq(folders.parentId, id))
				.limit(1);
			return !file && !child;
		}
	};
};
