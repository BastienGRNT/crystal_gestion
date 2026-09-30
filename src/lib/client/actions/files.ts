import type { ProjectFile } from '$lib/modules/files/domain/project-file';
import { send } from '../commands';
import { optimistic } from '../live/optimistic';
import type { ProjectStore } from '../project-store.svelte';
import { toasts } from '../toasts.svelte';
import { deleteWithUndo } from '../live/undoable';

export function fileActions(store: ProjectStore) {
	const projectId = () => store.project.id;
	const target = (id: string) => ({ projectId: projectId(), id });
	return {
		async upload(file: File, featureId: string | null) {
			const body = new FormData();
			body.set('file', file);
			if (featureId) body.set('featureId', featureId);
			const response = await fetch(`/api/projects/${projectId()}/files`, { method: 'POST', body });
			if (!response.ok)
				return toasts.error(
					(await response.json().catch(() => null))?.message ?? `Échec de l’envoi de ${file.name}`
				);
			store.upsert('file', (await response.json()) as ProjectFile);
		},
		update: (id: string, changes: { title?: string; featureId?: string | null }) =>
			optimistic(
				() => store.files.patch(id, changes),
				() => send('files.update', { ...target(id), changes })
			),
		remove: (id: string) =>
			deleteWithUndo(
				'Fichier supprimé',
				() => store.files.remove(id),
				() => send('files.delete', target(id))
			)
	};
}
