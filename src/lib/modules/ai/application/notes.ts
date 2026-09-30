import type { ChangeFeed } from '$lib/modules/kernel/application/ports';
import type { Actor } from '$lib/modules/kernel/domain/actor';
import { invalid, notFound } from '$lib/modules/kernel/domain/errors';
import type { AiNoteRepository } from './ports';

type Target = { projectId: string; id: string };

export function makeNoteUseCases(deps: { notes: AiNoteRepository; feed: ChangeFeed }) {
	const assertContent = (content: string) => {
		if (!content.trim()) throw invalid('La note est vide');
	};
	return {
		create: async (
			actor: Actor,
			{ projectId, content }: { projectId: string; content: string }
		) => {
			assertContent(content);
			const note = await deps.notes.create({
				projectId,
				content,
				source: 'team',
				createdBy: actor.id
			});
			deps.feed.upserted('aiNote', projectId, note);
			return note;
		},
		update: async (_actor: Actor, { projectId, id, content }: Target & { content: string }) => {
			assertContent(content);
			const note = await deps.notes.update(projectId, id, content);
			if (!note) throw notFound('Note');
			deps.feed.upserted('aiNote', projectId, note);
			return note;
		},
		remove: async (_actor: Actor, { projectId, id }: Target) => {
			if (!(await deps.notes.delete(projectId, id))) throw notFound('Note');
			deps.feed.deleted('aiNote', projectId, id);
		},
		list: (projectId: string) => deps.notes.list(projectId)
	};
}

export type AiModule = ReturnType<typeof makeNoteUseCases>;
