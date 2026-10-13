import { ensure, requiredText } from '../../kernel/domain/errors';

/** A folder of a project's documents. `system: 'chat'` collects what is shared in messages. */
export interface Folder {
	id: string;
	projectId: string;
	parentId: string | null;
	name: string;
	system: 'chat' | null;
	createdBy: string;
	createdAt: string;
}

export const CHAT_FOLDER = 'Partagés dans la discussion';

export function validFolderName(name: string): string {
	const clean = requiredText(name, 'Le nom du dossier', 60);
	ensure(!/[\\/]/.test(clean), 'Un nom de dossier ne contient pas de « / ».');
	return clean;
}

/** The folder and everything inside it, at any depth. */
export function subtree(folders: Folder[], id: string): string[] {
	const ids = [id];
	for (let i = 0; i < ids.length; i++)
		for (const folder of folders) if (folder.parentId === ids[i]) ids.push(folder.id);
	return ids;
}

/** A folder cannot go inside itself or one of its own subfolders. */
export const canMoveInto = (folders: Folder[], id: string, parentId: string | null) =>
	parentId === null || !subtree(folders, id).includes(parentId);

/** From the root down to this folder, for the breadcrumb. */
export function pathTo(folders: Folder[], id: string | null): Folder[] {
	const path: Folder[] = [];
	let current = folders.find((f) => f.id === id);
	while (current && path.length < 32) {
		path.unshift(current);
		current = folders.find((f) => f.id === current!.parentId);
	}
	return path;
}
