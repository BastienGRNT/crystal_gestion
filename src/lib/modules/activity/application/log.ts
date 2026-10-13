import type { ActivityLog, Notifier } from '../../kernel/application/ports';
import type { ActivityDeps } from './ports';

export const activityLog = (deps: ActivityDeps): ActivityLog => ({
	async record(entry) {
		const activity = {
			id: crypto.randomUUID(),
			projectId: entry.subject.projectId,
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
			projectId: input.subject.projectId,
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

/** "I've seen everything here": the next catch-up starts now. */
export const markSeen = (deps: ActivityDeps) => async (userId: string, projectId: string) => {
	await deps.access.assertMember(projectId, userId);
	const visit = { projectId, userId, seenAt: deps.clock.now().toISOString() };
	await deps.visits.save(visit);
	deps.visitFeed.saved(visit);
	return visit;
};
