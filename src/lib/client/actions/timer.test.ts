import { describe, expect, it } from 'vitest';
import type { RunningTimer } from '$lib/modules/time/domain/running-timer';
import type { TimeEntry } from '$lib/modules/time/domain/time-entry';
import { LiveCollection } from '../live/collection.svelte';
import type { ProjectStore } from '../project-store.svelte';
import { timerActions } from './timer';

const fakeStore = (entries: TimeEntry[] = []) =>
	({
		project: { id: 'p', slug: 'p', name: 'Projet' },
		tasks: new LiveCollection([
			{ id: 'a', ref: 'T-1', title: 'A' },
			{ id: 'b', ref: 'T-2', title: 'B' }
		]),
		timeEntries: new LiveCollection(entries),
		timer: null as RunningTimer | null
	}) as unknown as ProjectStore;

const running = (taskId: string, minutesAgo: number): TimeEntry => ({
	...{ id: `e-${taskId}`, projectId: 'p', userId: 'me', taskId, endedAt: null, source: 'timer' },
	startedAt: new Date(Date.now() - minutesAgo * 60_000).toISOString()
});

describe('timer actions', () => {
	it('shows the timer immediately and keeps it once the server answers, even without realtime', () => {
		const store = fakeStore();
		const timer = timerActions(store, 'me');
		timer.startLocally('a');
		expect(store.timer?.task.ref).toBe('T-1');
		const server = { ...store.timer!, entry: { ...store.timer!.entry, id: 'real' } };
		timer.confirm(server);
		expect(store.timer).toEqual(server);
		expect(store.timeEntries.items.map((e) => e.id)).toEqual(['real']);
	});

	it('stops the previous timer when another task starts', () => {
		const store = fakeStore([running('a', 30)]);
		timerActions(store, 'me').startLocally('b');
		expect(store.timeEntries.get('e-a')?.endedAt).not.toBeNull();
		expect(store.timer?.entry.taskId).toBe('b');
	});

	it('only stops the timer of the task being finished', () => {
		const store = fakeStore([running('a', 30)]);
		store.timer = {
			entry: running('a', 30),
			task: { ref: 'T-1', title: 'A' },
			project: store.project
		};
		timerActions(store, 'me').stopLocally('b');
		expect(store.timer).not.toBeNull();
		expect(store.timeEntries.get('e-a')?.endedAt).toBeNull();
	});

	it('forgets a timer stopped within a minute', () => {
		const store = fakeStore([running('a', 0)]);
		timerActions(store, 'me').stopLocally();
		expect(store.timeEntries.items).toEqual([]);
		expect(store.timer).toBeNull();
	});

	it('rolls everything back when the server refuses the start', () => {
		const store = fakeStore([running('a', 30)]);
		const rollback = timerActions(store, 'me').startLocally('b');
		rollback();
		expect(store.timeEntries.items.map((e) => [e.id, e.endedAt])).toEqual([['e-a', null]]);
		expect(store.timer).toBeNull();
	});
});
