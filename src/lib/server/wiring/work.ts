import { createFeaturesModule } from '$lib/modules/features';
import { drizzleFeatureRepository } from '$lib/modules/features/infrastructure/feature-repository';
import { createIdeasModule } from '$lib/modules/ideas';
import { drizzleIdeaStore } from '$lib/modules/ideas/infrastructure/idea-store';
import { createJournalModule } from '$lib/modules/journal';
import { drizzleJournalStore } from '$lib/modules/journal/infrastructure/journal-store';
import { createTasksModule } from '$lib/modules/tasks';
import { drizzleTaskRepository } from '$lib/modules/tasks/infrastructure/task-repository';
import { createTimeModule } from '$lib/modules/time';
import { drizzleRunningTimerQuery } from '$lib/modules/time/infrastructure/running-timer-query';
import { drizzleTimeEntryRepository } from '$lib/modules/time/infrastructure/time-entry-repository';
import { db } from '../db';
import { hubTimerFeed } from '../realtime/change-feed';
import { hub } from '../realtime/hub';
import type { Core } from './core';

/** What the project is made of: features, tasks, time, journal and ideas. */
export function wireWork({ shared, feed, clock, projectRepository, notifications }: Core) {
	const journal = createJournalModule({ ...shared, store: drizzleJournalStore(db) });
	const features = createFeaturesModule({
		...shared,
		features: drizzleFeatureRepository(db),
		scopeLog: journal.scopeLog,
		projectClock: {
			projectCreatedAt: async (id) =>
				new Date((await projectRepository.findById(id))?.createdAt ?? 0)
		}
	});
	const time = createTimeModule({
		...{ entries: drizzleTimeEntryRepository(db), running: drizzleRunningTimerQuery(db) },
		...{ timerFeed: hubTimerFeed(hub), feed, clock }
	});
	const tasks = createTasksModule({
		...shared,
		...{ tasks: drizzleTaskRepository(db), timer: time.timer, notifier: notifications.notifier }
	});
	const ideas = createIdeasModule({
		...shared,
		store: drizzleIdeaStore(db),
		converters: { createTask: tasks.create, createFeature: features.create }
	});
	return { journal, features, time, tasks, ideas };
}

export type Work = ReturnType<typeof wireWork>;
