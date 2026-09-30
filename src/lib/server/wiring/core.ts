import { env } from '$env/dynamic/private';
import { createActivityModule } from '$lib/modules/activity';
import { drizzleActivityRepository } from '$lib/modules/activity/infrastructure/activity-repository';
import { createElementsModule } from '$lib/modules/elements';
import { drizzleElementRepository } from '$lib/modules/elements/infrastructure/element-repository';
import { drizzleReferenceRepository } from '$lib/modules/elements/infrastructure/reference-repository';
import { createIdentityModule } from '$lib/modules/identity';
import { randomTokenService, scryptHasher } from '$lib/modules/identity/infrastructure/crypto';
import { drizzleSessionRepository } from '$lib/modules/identity/infrastructure/session-repository';
import { drizzleUserRepository } from '$lib/modules/identity/infrastructure/user-repository';
import type { Clock } from '$lib/modules/kernel/application/ports';
import { createNotificationsModule } from '$lib/modules/notifications';
import { drizzleNotificationRepository } from '$lib/modules/notifications/infrastructure/notification-repository';
import { createProjectsModule } from '$lib/modules/projects';
import { drizzleInvitationRepository } from '$lib/modules/projects/infrastructure/invitation-repository';
import { drizzleMemberRepository } from '$lib/modules/projects/infrastructure/member-repository';
import { drizzleProjectRepository } from '$lib/modules/projects/infrastructure/project-repository';
import { db } from '../db';
import { hubChangeFeed } from '../realtime/change-feed';
import { hub } from '../realtime/hub';

/** People, projects and the cross-cutting services every business module builds on. */
export function wireCore() {
	const clock: Clock = { now: () => new Date() };
	const feed = hubChangeFeed(hub);
	const tokens = randomTokenService;
	const projectRepository = drizzleProjectRepository(db);
	const memberRepository = drizzleMemberRepository(db);
	const identity = createIdentityModule({
		...{ users: drizzleUserRepository(db), sessions: drizzleSessionRepository(db) },
		...{ hasher: scryptHasher, tokens, clock },
		accessCode: env.REGISTRATION_CODE?.trim() || null
	});
	const projects = createProjectsModule({
		...{ projects: projectRepository, members: memberRepository },
		...{ invitations: drizzleInvitationRepository(db), tokens, feed, clock }
	});
	const elements = createElementsModule({
		...{ elements: drizzleElementRepository(db), references: drizzleReferenceRepository(db) },
		feed
	});
	const activity = createActivityModule({ activities: drizzleActivityRepository(db), feed });
	const notifications = createNotificationsModule({
		notifications: drizzleNotificationRepository(db),
		pusher: { push: (n) => hub.toUser(n.userId, { type: 'notification', data: n }) },
		clock
	});
	const shared = { feed, activity: activity.log, references: elements.referenceSync, clock };
	return {
		...{ clock, feed, shared, projectRepository, memberRepository },
		...{ identity, projects, elements, activity, notifications }
	};
}

export type Core = ReturnType<typeof wireCore>;
