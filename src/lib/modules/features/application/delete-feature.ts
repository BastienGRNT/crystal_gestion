import type { ActivityLog, ChangeFeed } from '$lib/modules/kernel/application/ports';
import type { Actor } from '$lib/modules/kernel/domain/actor';
import { notFound } from '$lib/modules/kernel/domain/errors';
import type { FeatureRepository, ScopeLog } from './ports';

interface Deps {
	features: FeatureRepository;
	scopeLog: ScopeLog;
	feed: ChangeFeed;
	activity: ActivityLog;
}

/** Tasks, ideas and files of the feature are kept: their feature link simply becomes empty. */
export const makeDeleteFeature =
	(deps: Deps) =>
	async (actor: Actor, { projectId, id }: { projectId: string; id: string }) => {
		const feature = await deps.features.find(projectId, id);
		if (!feature) throw notFound('Feature');
		await deps.scopeLog.record(actor, feature, { change: 'removed', priority: feature.priority });
		await deps.features.delete(projectId, id);
		deps.feed.deleted('feature', projectId, id);
		await deps.activity.record({ projectId, actor, verb: 'deleted', element: feature });
	};
