import type { RunningTimer } from '$lib/modules/time/domain/running-timer';
import { isRunning, isTooShort, type TimeEntry } from '$lib/modules/time/domain/time-entry';
import { combine, draftId, isDraft } from '../live/optimistic';
import type { ProjectStore } from '../project-store.svelte';

/** Local mirror of the server timer rules, for instant feedback. */
export function timerActions(store: ProjectStore, meId: string) {
	const setTimer = (timer: RunningTimer | null) => {
		const previous = store.timer;
		store.timer = timer;
		return () => (store.timer = previous);
	};
	const close = (entry: TimeEntry, endedAt: string) =>
		isTooShort(entry, endedAt)
			? store.timeEntries.remove(entry.id)
			: store.timeEntries.patch(entry.id, { endedAt });
	/** Stops my timers, or only the ones on `taskId` (a task done or deleted). */
	const stopLocally = (taskId?: string) => {
		const endedAt = new Date().toISOString();
		const stopped = store.timeEntries.items.filter(
			(e) => e.userId === meId && isRunning(e) && (!taskId || e.taskId === taskId)
		);
		const clears = !taskId || store.timer?.entry.taskId === taskId;
		return combine(...stopped.map((e) => close(e, endedAt)), clears ? setTimer(null) : () => {});
	};
	const startLocally = (taskId: string) => {
		const task = store.tasks.get(taskId);
		if (!task || store.timer?.entry.taskId === taskId) return () => {};
		const stop = stopLocally();
		const entry: TimeEntry = {
			...{ id: draftId(), projectId: store.project.id, userId: meId, taskId },
			...{ startedAt: new Date().toISOString(), endedAt: null, source: 'timer' }
		};
		store.timeEntries.upsert(entry);
		const { slug, name } = store.project;
		const show = setTimer({
			entry,
			task: { ref: task.ref, title: task.title },
			project: { slug, name }
		});
		return combine(() => store.timeEntries.remove(entry.id), stop, show);
	};
	/** The server answer is authoritative, whether or not its realtime echo already arrived. */
	const confirm = (timer: RunningTimer | null) => {
		for (const entry of store.timeEntries.items.filter((e) => isDraft(e.id)))
			store.timeEntries.remove(entry.id);
		if (timer?.entry.projectId === store.project.id) store.timeEntries.upsert(timer.entry);
		store.timer = timer;
	};
	return { startLocally, stopLocally, confirm };
}
