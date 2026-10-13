import type { ActivityLog, Notifier } from '../../kernel/application/ports';
import type { ActivityDeps } from './ports';

export const activityLog = (deps: ActivityDeps): ActivityLog => ({
	async record(entry) {
		const activity = {
			id: crypto.randomUUID(),
			...entry,
			createdAt: deps.clock.now().toISOString()
		};
		await deps.activities.insert(activity);
		deps.feed.saved(activity);
	}
});

export const notifier = (deps: ActivityDeps): Notifier => ({
	async notify(input) {
		const notification = {
			id: crypto.randomUUID(),
			...input,
			createdAt: deps.clock.now().toISOString(),
			readAt: null
		};
		await deps.notifications.insert(notification);
		deps.inbox.deliver(notification);
	}
});

export const markNotificationsRead =
	(deps: ActivityDeps) => async (userId: string, ids: string[] | 'all') => {
		const changed = await deps.notifications.markRead(userId, ids, deps.clock.now());
		for (const notification of changed) deps.inbox.deliver(notification);
		return changed.length;
	};
