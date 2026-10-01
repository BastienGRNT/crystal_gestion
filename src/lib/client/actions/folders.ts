import type { Folder } from '$lib/modules/files/domain/folder';
import { send } from '../commands';
import { draftId, optimistic } from '../live/optimistic';
import { deleteWithUndo } from '../live/undoable';
import type { ProjectStore } from '../project-store.svelte';
import { createOptimistically } from './create';

export type NewFolder = Pick<Folder, 'featureId' | 'parentId' | 'name'>;

export function folderActions(store: ProjectStore) {
	const projectId = () => store.project.id;
	const target = (id: string) => ({ projectId: projectId(), id });
	return {
		create: (input: NewFolder) =>
			createOptimistically(
				store,
				'folder',
				{ id: draftId(), projectId: projectId(), createdAt: new Date().toISOString(), ...input },
				() => send('folders.create', { projectId: projectId(), ...input })
			),
		rename: (id: string, name: string) =>
			optimistic(
				() => store.folders.patch(id, { name }),
				() => send('folders.rename', { ...target(id), name })
			),
		remove: (id: string) =>
			deleteWithUndo(
				'Dossier supprimé',
				() => store.folders.remove(id),
				() => send('folders.delete', target(id))
			)
	};
}
