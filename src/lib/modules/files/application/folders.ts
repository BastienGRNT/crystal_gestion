import type { ChangeFeed } from '$lib/modules/kernel/application/ports';
import type { Actor } from '$lib/modules/kernel/domain/actor';
import { conflict, invalid, notFound } from '$lib/modules/kernel/domain/errors';
import type { FileLocation } from '../domain/folder';
import type { FolderRepository } from './ports';

type Target = { projectId: string; id: string };
type Deps = { folders: FolderRepository; feed: ChangeFeed };

const cleanName = (name: string) => {
	if (!name.trim()) throw invalid('Le dossier n’a pas de nom');
	return name.trim();
};

/** A sub-folder decides the root: callers cannot put a file in a folder of another feature. */
export const makeResolveLocation =
	({ folders }: Deps) =>
	async (projectId: string, { featureId, folderId }: FileLocation): Promise<FileLocation> => {
		if (!folderId) return { featureId, folderId: null };
		const folder = await folders.find(projectId, folderId);
		if (!folder) throw notFound('Dossier');
		return { featureId: folder.featureId, folderId };
	};

export function makeFolderUseCases(deps: Deps) {
	const resolve = makeResolveLocation(deps);
	return {
		create: async (
			_actor: Actor,
			input: { projectId: string; featureId: string | null; parentId: string | null; name: string }
		) => {
			const root = await resolve(input.projectId, { ...input, folderId: input.parentId });
			const folder = await deps.folders.create({
				projectId: input.projectId,
				featureId: root.featureId,
				parentId: root.folderId,
				name: cleanName(input.name)
			});
			deps.feed.upserted('folder', folder.projectId, folder);
			return folder;
		},
		rename: async (_actor: Actor, { projectId, id, name }: Target & { name: string }) => {
			const folder = await deps.folders.rename(projectId, id, cleanName(name));
			if (!folder) throw notFound('Dossier');
			deps.feed.upserted('folder', projectId, folder);
			return folder;
		},
		/** Only empty folders: deleting never takes files with it. */
		remove: async (_actor: Actor, { projectId, id }: Target) => {
			if (!(await deps.folders.isEmpty(id))) throw conflict('Le dossier n’est pas vide');
			if (!(await deps.folders.delete(projectId, id))) throw notFound('Dossier');
			deps.feed.deleted('folder', projectId, id);
		},
		list: (projectId: string) => deps.folders.list(projectId)
	};
}
