import type { ActivityLog, ChangeFeed, Clock } from '$lib/modules/kernel/application/ports';
import type { Actor } from '$lib/modules/kernel/domain/actor';
import { notFound } from '$lib/modules/kernel/domain/errors';
import type { FeatureRepository } from './ports';

interface Deps {
	features: FeatureRepository;
	feed: ChangeFeed;
	activity: ActivityLog;
	clock: Clock;
}

export interface ArchiveFeature {
	projectId: string;
	id: string;
	archived: boolean;
}

/** Archiving keeps everything (tasks, thread, files): the feature only leaves day-to-day lists. */
export const makeArchiveFeature =
	(deps: Deps) =>
	async (actor: Actor, { projectId, id, archived }: ArchiveFeature) => {
		if (!(await deps.features.find(projectId, id))) throw notFound('Feature');
		const at = archived ? deps.clock.now() : null;
		const feature = await deps.features.setArchived(projectId, id, at);
		deps.feed.upserted('feature', projectId, feature);
		const verb = archived ? 'archived' : 'updated';
		await deps.activity.record({ projectId, actor, verb, element: feature });
		return feature;
	};
