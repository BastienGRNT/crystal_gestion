import type { ActivityLog, ChangeFeed } from '$lib/modules/kernel/application/ports';
import type { ActivityRepository } from './ports';

export const makeActivityLog = (deps: {
	activities: ActivityRepository;
	feed: ChangeFeed;
}): ActivityLog => ({
	async record({ projectId, actor, verb, element, details = {} }) {
		const activity = await deps.activities.insert({
			projectId,
			actorId: actor.id,
			verb,
			elementId: verb === 'deleted' ? null : element.id,
			elementRef: element.ref,
			elementKind: element.kind,
			elementTitle: element.title,
			details
		});
		deps.feed.upserted('activity', projectId, activity);
	}
});
