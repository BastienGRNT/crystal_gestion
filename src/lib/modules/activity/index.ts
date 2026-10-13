import { activityLog, markNotificationsRead, notifier } from './application/log';
import type { ActivityDeps } from './application/ports';

export function createActivity(deps: ActivityDeps) {
	return {
		log: activityLog(deps),
		notifier: notifier(deps),
		recent: (limit = 80) => deps.activities.recent(limit),
		notificationsFor: (userId: string) => deps.notifications.forUser(userId, 60),
		markRead: markNotificationsRead(deps)
	};
}

export type ActivityModule = ReturnType<typeof createActivity>;
