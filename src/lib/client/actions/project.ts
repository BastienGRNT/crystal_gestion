import type { Framing } from '$lib/modules/projects/domain/project';
import type { TaskView } from '$lib/modules/identity/domain/user';
import { send } from '../commands';
import { attempt, optimistic } from '../live/optimistic';
import type { ProjectStore } from '../project-store.svelte';
import { deleteWithUndo } from '../live/undoable';

export function projectActions(store: ProjectStore, meId: string) {
	const projectId = () => store.project.id;
	return {
		updateFraming: (changes: Partial<Framing>) =>
			optimistic(
				() => {
					const previous = { ...store.project };
					store.project = { ...store.project, ...changes };
					return () => (store.project = previous);
				},
				() => send('projects.updateFraming', { projectId: projectId(), changes })
			),
		createInvitation: () =>
			attempt(() => send('projects.createInvitation', { projectId: projectId() })),
		addMember: (userId: string) =>
			attempt(() => send('projects.addMember', { projectId: projectId(), userId })),
		markNotificationsRead: () =>
			optimistic(
				() => {
					const unread = store.notifications.items.filter((n) => !n.readAt && n.userId === meId);
					const now = new Date().toISOString();
					const rollbacks = unread.map((n) => store.notifications.patch(n.id, { readAt: now }));
					return () => rollbacks.forEach((rollback) => rollback());
				},
				() => send('notifications.markAllRead', { projectId: projectId() })
			),
		createNote: (content: string) =>
			attempt(async () =>
				store.upsert('aiNote', await send('aiNotes.create', { projectId: projectId(), content }))
			),
		updateNote: (id: string, content: string) =>
			optimistic(
				() => store.aiNotes.patch(id, { content }),
				() => send('aiNotes.update', { projectId: projectId(), id, content })
			),
		removeNote: (id: string) =>
			deleteWithUndo(
				'Note supprimée',
				() => store.aiNotes.remove(id),
				() => send('aiNotes.delete', { projectId: projectId(), id })
			),
		setTaskView: (taskView: TaskView) =>
			attempt(() => send('identity.updatePreferences', { taskView }))
	};
}
