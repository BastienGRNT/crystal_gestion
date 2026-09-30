import { randomUUID } from 'node:crypto';
import { env } from '$env/dynamic/private';
import { createActivityModule } from '$lib/modules/activity';
import { drizzleActivityRepository } from '$lib/modules/activity/infrastructure/activity-repository';
import { makeBuildProjectContext } from '$lib/modules/ai/application/build-context';
import { makeNoteUseCases } from '$lib/modules/ai/application/notes';
import {
	drizzleAiNoteRepository,
	unavailableAiProvider
} from '$lib/modules/ai/infrastructure/ai-note-repository';
import { createDiscussionModule } from '$lib/modules/discussion';
import { drizzleMessageRepository } from '$lib/modules/discussion/infrastructure/message-repository';
import { drizzleQuestionRepository } from '$lib/modules/discussion/infrastructure/question-repository';
import { createElementsModule } from '$lib/modules/elements';
import { drizzleElementRepository } from '$lib/modules/elements/infrastructure/element-repository';
import { drizzleReferenceRepository } from '$lib/modules/elements/infrastructure/reference-repository';
import { createFeaturesModule } from '$lib/modules/features';
import { drizzleFeatureRepository } from '$lib/modules/features/infrastructure/feature-repository';
import { createFilesModule } from '$lib/modules/files';
import { diskStorage } from '$lib/modules/files/infrastructure/disk-storage';
import { drizzleFileStore } from '$lib/modules/files/infrastructure/file-store';
import { createIdeasModule } from '$lib/modules/ideas';
import { drizzleIdeaStore } from '$lib/modules/ideas/infrastructure/idea-store';
import { createIdentityModule } from '$lib/modules/identity';
import { randomTokenService, scryptHasher } from '$lib/modules/identity/infrastructure/crypto';
import { drizzleSessionRepository } from '$lib/modules/identity/infrastructure/session-repository';
import { drizzleUserRepository } from '$lib/modules/identity/infrastructure/user-repository';
import { createJournalModule } from '$lib/modules/journal';
import { drizzleJournalStore } from '$lib/modules/journal/infrastructure/journal-store';
import type { Clock } from '$lib/modules/kernel/application/ports';
import { createNotificationsModule } from '$lib/modules/notifications';
import { drizzleNotificationRepository } from '$lib/modules/notifications/infrastructure/notification-repository';
import { makeAvailabilityUseCases } from '$lib/modules/planning/application/availabilities';
import {
	drizzleAvailabilityRepository,
	drizzleUserProjects
} from '$lib/modules/planning/infrastructure/availability-repository';
import { createProjectsModule } from '$lib/modules/projects';
import { drizzleInvitationRepository } from '$lib/modules/projects/infrastructure/invitation-repository';
import { drizzleMemberRepository } from '$lib/modules/projects/infrastructure/member-repository';
import { drizzleProjectRepository } from '$lib/modules/projects/infrastructure/project-repository';
import { createResourcesModule } from '$lib/modules/resources';
import {
	drizzleAccountStore,
	drizzleContactStore,
	drizzleLinkStore,
	plainTextCipher
} from '$lib/modules/resources/infrastructure/stores';
import { createTasksModule } from '$lib/modules/tasks';
import { drizzleTaskRepository } from '$lib/modules/tasks/infrastructure/task-repository';
import { createTimeModule } from '$lib/modules/time';
import { drizzleRunningTimerQuery } from '$lib/modules/time/infrastructure/running-timer-query';
import { drizzleTimeEntryRepository } from '$lib/modules/time/infrastructure/time-entry-repository';
import { db } from './db';
import { hubChangeFeed, hubTimerFeed } from './realtime/change-feed';
import { hub } from './realtime/hub';

/** Composition root: the only place where concrete adapters meet use cases. */
export function createContainer() {
	const clock: Clock = { now: () => new Date() };
	const feed = hubChangeFeed(hub);
	const tokens = randomTokenService;

	const identity = createIdentityModule({
		users: drizzleUserRepository(db),
		sessions: drizzleSessionRepository(db),
		hasher: scryptHasher,
		tokens,
		clock,
		accessCode: env.REGISTRATION_CODE?.trim() || null
	});
	const projectRepository = drizzleProjectRepository(db);
	const memberRepository = drizzleMemberRepository(db);
	const projects = createProjectsModule({
		projects: projectRepository,
		members: memberRepository,
		invitations: drizzleInvitationRepository(db),
		tokens,
		feed,
		clock
	});
	const elements = createElementsModule({
		elements: drizzleElementRepository(db),
		references: drizzleReferenceRepository(db),
		feed
	});
	const activity = createActivityModule({ activities: drizzleActivityRepository(db), feed });
	const notifications = createNotificationsModule({
		notifications: drizzleNotificationRepository(db),
		pusher: {
			push: (notification) =>
				hub.toUser(notification.userId, { type: 'notification', data: notification })
		},
		clock
	});
	const shared = { feed, activity: activity.log, references: elements.referenceSync, clock };

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
		entries: drizzleTimeEntryRepository(db),
		running: drizzleRunningTimerQuery(db),
		timerFeed: hubTimerFeed(hub),
		feed,
		clock
	});
	const tasks = createTasksModule({
		...shared,
		tasks: drizzleTaskRepository(db),
		timer: time.timer,
		notifier: notifications.notifier
	});
	const ideas = createIdeasModule({
		...shared,
		store: drizzleIdeaStore(db),
		converters: { createTask: tasks.create, createFeature: features.create }
	});
	const discussion = createDiscussionModule({
		...shared,
		messages: drizzleMessageRepository(db),
		questions: drizzleQuestionRepository(db),
		members: {
			names: async (projectId) =>
				new Map((await memberRepository.list(projectId)).map((m) => [m.id, m.name]))
		},
		notifier: notifications.notifier
	});
	const planning = makeAvailabilityUseCases({
		availabilities: drizzleAvailabilityRepository(db),
		projects: drizzleUserProjects(db),
		feed
	});
	const resources = createResourcesModule({
		...shared,
		accounts: drizzleAccountStore(db, plainTextCipher),
		links: drizzleLinkStore(db),
		contacts: drizzleContactStore(db)
	});
	const files = createFilesModule({
		...shared,
		store: drizzleFileStore(db),
		storage: diskStorage(env.UPLOAD_DIR ?? './data/uploads'),
		newKey: randomUUID
	});
	const aiNotes = drizzleAiNoteRepository(db);
	const ai = {
		notes: makeNoteUseCases({ notes: aiNotes, feed }),
		provider: unavailableAiProvider,
		context: makeBuildProjectContext({
			project: (id) => projectRepository.findById(id),
			features: features.list,
			tasks: tasks.list,
			journal: journal.list,
			elements: elements.listElements,
			references: elements.listReferences,
			notes: aiNotes.list
		})
	};

	return {
		clock,
		identity,
		projects,
		elements,
		activity,
		notifications,
		journal,
		features,
		time,
		tasks,
		ideas,
		discussion,
		planning,
		resources,
		files,
		ai,
		presence: (projectId: string) => hub.onlineUserIds(projectId)
	};
}

export type Container = ReturnType<typeof createContainer>;

export const container = createContainer();
