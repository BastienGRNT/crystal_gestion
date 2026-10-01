import { randomUUID } from 'node:crypto';
import { env } from '$env/dynamic/private';
import { createDiscussionModule } from '$lib/modules/discussion';
import { drizzleChannelRepository } from '$lib/modules/discussion/infrastructure/channel-repository';
import { drizzleMessageRepository } from '$lib/modules/discussion/infrastructure/message-repository';
import { drizzleQuestionRepository } from '$lib/modules/discussion/infrastructure/question-repository';
import { createFilesModule } from '$lib/modules/files';
import { diskStorage } from '$lib/modules/files/infrastructure/disk-storage';
import { drizzleFileStore } from '$lib/modules/files/infrastructure/file-store';
import { drizzleFolderRepository } from '$lib/modules/files/infrastructure/folder-repository';
import { makeAvailabilityUseCases } from '$lib/modules/planning/application/availabilities';
import {
	drizzleAvailabilityRepository,
	drizzleUserProjects
} from '$lib/modules/planning/infrastructure/availability-repository';
import { createResourcesModule } from '$lib/modules/resources';
import {
	drizzleAccountStore,
	drizzleContactStore,
	drizzleLinkStore,
	plainTextCipher
} from '$lib/modules/resources/infrastructure/stores';
import { db } from '../db';
import type { Core } from './core';

/** Working together: discussion, availabilities, shared resources and files. */
export function wireCollaboration({ shared, feed, memberRepository, notifications }: Core) {
	const discussion = createDiscussionModule({
		...shared,
		...{ messages: drizzleMessageRepository(db), questions: drizzleQuestionRepository(db) },
		channels: drizzleChannelRepository(db),
		members: {
			names: async (projectId) =>
				new Map((await memberRepository.list(projectId)).map((m) => [m.id, m.name]))
		},
		notifier: notifications.notifier
	});
	const planning = makeAvailabilityUseCases({
		...{ availabilities: drizzleAvailabilityRepository(db), projects: drizzleUserProjects(db) },
		feed
	});
	const resources = createResourcesModule({
		...shared,
		accounts: drizzleAccountStore(db, plainTextCipher),
		...{ links: drizzleLinkStore(db), contacts: drizzleContactStore(db) }
	});
	const files = createFilesModule({
		...shared,
		store: drizzleFileStore(db),
		folders: drizzleFolderRepository(db),
		storage: diskStorage(env.UPLOAD_DIR ?? './data/uploads'),
		newKey: randomUUID
	});
	return { discussion, planning, resources, files };
}
