import type { ChangeFeed, Clock } from '$lib/modules/kernel/application/ports';
import type { TaskTimer } from '$lib/modules/tasks/application/ports';
import type { TimeEntry } from '../domain/time-entry';
import type { TimeEntryRepository } from './ports';

interface Deps {
	entries: TimeEntryRepository;
	feed: ChangeFeed;
	clock: Clock;
}

/** One running timer per person, across projects: starting one stops the previous. */
export function makeTaskTimer(deps: Deps): TaskTimer {
	const stopAll = async (running: TimeEntry[]) => {
		const endedAt = deps.clock.now().toISOString();
		for (const entry of running) {
			const stopped = await deps.entries.update(entry.id, { endedAt });
			deps.feed.upserted('timeEntry', stopped.projectId, stopped);
		}
	};
	return {
		async start(projectId, userId, taskId) {
			const running = await deps.entries.runningForUser(userId);
			if (running.some((entry) => entry.taskId === taskId)) return;
			await stopAll(running);
			const startedAt = deps.clock.now().toISOString();
			const entry = await deps.entries.create({
				projectId,
				userId,
				taskId,
				startedAt,
				endedAt: null,
				source: 'timer'
			});
			deps.feed.upserted('timeEntry', projectId, entry);
		},
		stopForUser: async (userId) => stopAll(await deps.entries.runningForUser(userId)),
		stopForTask: async (taskId) => stopAll(await deps.entries.runningForTask(taskId))
	};
}
