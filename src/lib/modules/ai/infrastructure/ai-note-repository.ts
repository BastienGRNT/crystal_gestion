import { and, asc, eq } from 'drizzle-orm';
import type { Executor } from '$lib/server/db/types';
import type { AiNoteRepository, AiProvider } from '../application/ports';
import type { AiNote } from '../domain/ai-note';
import { aiNotes } from './schema';

const toNote = (row: typeof aiNotes.$inferSelect): AiNote => ({
	...row,
	createdAt: row.createdAt.toISOString(),
	updatedAt: row.updatedAt.toISOString()
});

export const drizzleAiNoteRepository = (db: Executor): AiNoteRepository => {
	const owned = (projectId: string, id: string) =>
		and(eq(aiNotes.projectId, projectId), eq(aiNotes.id, id));
	return {
		create: async (note) => toNote((await db.insert(aiNotes).values(note).returning())[0]),
		update: async (projectId, id, content) => {
			const [row] = await db
				.update(aiNotes)
				.set({ content, updatedAt: new Date() })
				.where(owned(projectId, id))
				.returning();
			return row ? toNote(row) : null;
		},
		delete: async (projectId, id) =>
			(await db.delete(aiNotes).where(owned(projectId, id)).returning()).length > 0,
		list: async (projectId) =>
			(
				await db
					.select()
					.from(aiNotes)
					.where(eq(aiNotes.projectId, projectId))
					.orderBy(asc(aiNotes.createdAt))
			).map(toNote)
	};
};

export const unavailableAiProvider: AiProvider = {
	available: false,
	complete: async () => {
		throw new Error('Aucun fournisseur d’IA configuré');
	}
};
