import { activityLog, markNotificationsRead, markSeen, notifier } from './application/log';
import type { ActivityDeps } from './application/ports';

export function createActivity(deps: ActivityDeps) {
	return {
		log: activityLog(deps),
		notifier: notifier(deps),
		recent: (projectIds: string[]) => deps.activities.recent(projectIds, 40),
		notificationsFor: (userId: string) => deps.notifications.forUser(userId, 60),
		markRead: markNotificationsRead(deps),
		visitsOf: (userId: string) => deps.visits.of(userId),
		markSeen: markSeen(deps)
	};
}

export type ActivityModule = ReturnType<typeof createActivity>;
