import { send } from '../commands';
import { combine, draftId, optimistic } from '../live/optimistic';
import { deleteWithUndo } from '../live/undoable';
import type { ProjectStore } from '../project-store.svelte';
import { createOptimistically } from './create';

export function channelActions(store: ProjectStore) {
	const projectId = () => store.project.id;
	const target = (id: string) => ({ projectId: projectId(), id });
	return {
		create: (name: string) =>
			createOptimistically(
				store,
				'channel',
				{ id: draftId(), projectId: projectId(), name, createdAt: new Date().toISOString() },
				() => send('channels.create', { projectId: projectId(), name })
			),
		rename: (id: string, name: string) =>
			optimistic(
				() => store.channels.patch(id, { name }),
				() => send('channels.rename', { ...target(id), name })
			),
		/** Its messages go with it, so they leave the screen too. */
		remove: (id: string) =>
			deleteWithUndo(
				'Canal supprimé',
				() =>
					combine(
						store.channels.remove(id),
						...store.messages.items
							.filter((m) => m.channelId === id)
							.map((m) => store.messages.remove(m.id))
					),
				() => send('channels.delete', target(id))
			)
	};
}
