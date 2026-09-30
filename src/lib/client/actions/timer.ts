import { isRunning, type TimeEntry } from '$lib/modules/time/domain/time-entry';
import { draftId, isDraft } from '../live/optimistic';
import type { ProjectStore } from '../project-store.svelte';

/** Local mirror of the server timer rules, for instant feedback. */
export function timerActions(store: ProjectStore, meId: string) {
	const mine = () =>
		store.timeEntries.items.filter((entry) => entry.userId === meId && isRunning(entry));
	const stopLocally = () => {
		const endedAt = new Date().toISOString();
		const rollbacks = mine().map((entry) => store.timeEntries.patch(entry.id, { endedAt }));
		return () => rollbacks.forEach((rollback) => rollback());
	};
	const startLocally = (taskId: string) => {
		if (mine().some((entry) => entry.taskId === taskId)) return () => {};
		const restore = stopLocally();
		const entry: TimeEntry = {
			id: draftId(),
			projectId: store.project.id,
			userId: meId,
			taskId,
			startedAt: new Date().toISOString(),
			endedAt: null,
			source: 'timer'
		};
		store.timeEntries.upsert(entry);
		return () => (store.timeEntries.remove(entry.id), restore());
	};
	/** The server echo carries the real entry: the local draft is no longer needed. */
	const dropDrafts = () =>
		store.timeEntries.items
			.filter((entry) => isDraft(entry.id))
			.forEach((entry) => store.timeEntries.remove(entry.id));
	return { startLocally, stopLocally, dropDrafts };
}
