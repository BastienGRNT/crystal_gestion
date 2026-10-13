import { forbidden, invalid, notFound } from '../../kernel/domain/errors';
import { CHAT_FOLDER, canMoveInto, subtree, validFolderName, type Folder } from '../domain/folder';
import type { FileDeps } from './ports';

export async function memberFolder(deps: FileDeps, id: string, actorId: string) {
	const folder = await deps.folders.get(id);
	if (!folder) throw notFound('Dossier');
	await deps.access.assertMember(folder.projectId, actorId);
	return folder;
}

/** A folder given by the client must exist in that same project. */
export async function checkFolder(
	deps: FileDeps,
	projectId: string,
	folderId: string | null,
	actorId: string
) {
	if (folderId === null) return;
	const folder = await memberFolder(deps, folderId, actorId);
	if (folder.projectId !== projectId) throw invalid('Ce dossier est dans un autre projet.');
}

export const createFolder =
	(deps: FileDeps) =>
	async (
		input: { id: string; projectId: string; parentId: string | null; name: string },
		actorId: string
	) => {
		await deps.access.assertMember(input.projectId, actorId);
		await checkFolder(deps, input.projectId, input.parentId, actorId);
		const folder: Folder = {
			...input,
			name: validFolderName(input.name),
			system: null,
			createdBy: actorId,
			createdAt: deps.clock.now().toISOString()
		};
		await deps.folders.insert(folder);
		deps.folderFeed.saved(folder);
		return folder;
	};

/** Where files shared in the discussion land, created the first time. */
export async function chatFolder(deps: FileDeps, projectId: string, actorId: string) {
	const existing = await deps.folders.chatFolder(projectId);
	if (existing) return existing;
	const folder: Folder = {
		id: crypto.randomUUID(),
		projectId,
		parentId: null,
		name: CHAT_FOLDER,
		system: 'chat',
		createdBy: actorId,
		createdAt: deps.clock.now().toISOString()
	};
	await deps.folders.insert(folder);
	deps.folderFeed.saved(folder);
	return folder;
}

export const updateFolder =
	(deps: FileDeps) =>
	async (id: string, patch: { name?: string; parentId?: string | null }, actorId: string) => {
		const current = await memberFolder(deps, id, actorId);
		if (current.system)
			throw forbidden('Ce dossier est rempli par la discussion : il garde sa place et son nom.');
		const folder = { ...current };
		if (patch.name !== undefined) folder.name = validFolderName(patch.name);
		if (patch.parentId !== undefined) {
			await checkFolder(deps, current.projectId, patch.parentId, actorId);
			const all = await deps.folders.ofProjects([current.projectId]);
			if (!canMoveInto(all, id, patch.parentId))
				throw invalid('Un dossier ne peut pas aller dans un de ses sous-dossiers.');
			folder.parentId = patch.parentId;
		}
		await deps.folders.save(folder);
		deps.folderFeed.saved(folder);
		return folder;
	};

/** Deletes the folder with everything inside (the client offers to undo before sending this). */
export const deleteFolder = (deps: FileDeps) => async (id: string, actorId: string) => {
	const folder = await memberFolder(deps, id, actorId);
	const all = await deps.folders.ofProjects([folder.projectId]);
	const ids = subtree(all, id);
	for (const file of await deps.files.inFolders(ids)) {
		await deps.files.delete(file.id);
		await deps.blobs.remove(file.id);
		deps.feed.removed(file);
	}
	await deps.folders.delete(id);
	for (const removed of all.filter((f) => ids.includes(f.id))) deps.folderFeed.removed(removed);
};
