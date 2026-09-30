import type { ActivityLog, ChangeFeed, ReferenceSync } from '$lib/modules/kernel/application/ports';
import type { Actor } from '$lib/modules/kernel/domain/actor';
import { notFound } from '$lib/modules/kernel/domain/errors';
import type { FeatureFields } from '../domain/feature';
import type { FeatureRepository, ScopeLog } from './ports';

interface Deps {
	features: FeatureRepository;
	scopeLog: ScopeLog;
	feed: ChangeFeed;
	activity: ActivityLog;
	references: ReferenceSync;
}

export interface FeatureChanges {
	projectId: string;
	id: string;
	changes: Partial<FeatureFields>;
}

export const makeUpdateFeature =
	(deps: Deps) =>
	async (actor: Actor, { projectId, id, changes }: FeatureChanges) => {
		const before = await deps.features.find(projectId, id);
		if (!before) throw notFound('Feature');
		const feature = await deps.features.update(projectId, id, changes);
		deps.feed.upserted('feature', projectId, feature);
		if (changes.description !== undefined || changes.doneCriteria !== undefined)
			await deps.references.sync(projectId, id, [feature.description, feature.doneCriteria]);
		if (before.priority !== feature.priority)
			await deps.scopeLog.record(actor, feature, {
				change: 'reprioritized',
				from: before.priority,
				to: feature.priority
			});
		await deps.activity.record({ projectId, actor, verb: 'updated', element: feature });
		return feature;
	};
