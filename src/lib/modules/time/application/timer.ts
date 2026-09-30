import type { ChangeFeed, Clock } from '$lib/modules/kernel/application/ports';
import type { TaskTimer } from '$lib/modules/tasks/application/ports';
import { isTooShort, type TimeEntry } from '../domain/time-entry';
import type { RunningTimerQuery, TimeEntryRepository, TimerFeed } from './ports';

export interface TimerDeps {
	entries: TimeEntryRepository;
	feed: ChangeFeed;
	clock: Clock;
	running: RunningTimerQuery;
	timerFeed: TimerFeed;
}

/** One running timer per person, across projects: starting one stops the previous. */
export function makeTaskTimer(deps: TimerDeps): TaskTimer {
	const close = async (entry: TimeEntry, endedAt: string) => {
		if (!isTooShort(entry, endedAt)) {
			const stopped = await deps.entries.update(entry.id, { endedAt });
			return deps.feed.upserted('timeEntry', stopped.projectId, stopped);
		}
		await deps.entries.delete(entry.id);
		deps.feed.deleted('timeEntry', entry.projectId, entry.id);
	};
	const closeAll = async (running: TimeEntry[]) => {
		const endedAt = deps.clock.now().toISOString();
		for (const entry of running) await close(entry, endedAt);
	};
	const publish = async (userId: string) => {
		const timer = await deps.running.forUser(userId);
		deps.timerFeed.changed(userId, timer);
		return timer;
	};
	return {
		async start(projectId, userId, taskId) {
			const running = await deps.entries.runningForUser(userId);
			if (running.some((entry) => entry.taskId === taskId)) return publish(userId);
			await closeAll(running);
			const startedAt = deps.clock.now().toISOString();
			const entry = await deps.entries.create({
				...{ projectId, userId, taskId, startedAt },
				...{ endedAt: null, source: 'timer' }
			});
			deps.feed.upserted('timeEntry', projectId, entry);
			return publish(userId);
		},
		async stopForUser(userId) {
			await closeAll(await deps.entries.runningForUser(userId));
			await publish(userId);
		},
		async stopForTask(taskId) {
			const running = await deps.entries.runningForTask(taskId);
			await closeAll(running);
			for (const userId of new Set(running.map((entry) => entry.userId))) await publish(userId);
		}
	};
}
