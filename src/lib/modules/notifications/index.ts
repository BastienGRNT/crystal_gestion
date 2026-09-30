import type { Clock } from '$lib/modules/kernel/application/ports';
import { makeNotifier } from './application/notify';
import type { NotificationPusher, NotificationRepository } from './application/ports';

const LIST_LIMIT = 50;

export function createNotificationsModule(deps: {
	notifications: NotificationRepository;
	pusher: NotificationPusher;
	clock: Clock;
}) {
	return {
		notifier: makeNotifier(deps),
		list: (userId: string, projectId: string) =>
			deps.notifications.listForUser(userId, projectId, LIST_LIMIT),
		markAllRead: (userId: string, projectId: string) =>
			deps.notifications.markRead(userId, projectId, deps.clock.now())
	};
}

export type NotificationsModule = ReturnType<typeof createNotificationsModule>;
