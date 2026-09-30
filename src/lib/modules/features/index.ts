import type {
	ActivityLog,
	ChangeFeed,
	Clock,
	ReferenceSync
} from '$lib/modules/kernel/application/ports';
import { makeCreateFeature } from './application/create-feature';
import { makeDeleteFeature } from './application/delete-feature';
import type { FeatureRepository, ProjectClock, ScopeLog } from './application/ports';
import { makeUpdateFeature } from './application/update-feature';

export interface FeaturesDeps {
	features: FeatureRepository;
	scopeLog: ScopeLog;
	projectClock: ProjectClock;
	feed: ChangeFeed;
	activity: ActivityLog;
	references: ReferenceSync;
	clock: Clock;
}

export function createFeaturesModule(deps: FeaturesDeps) {
	return {
		create: makeCreateFeature(deps),
		update: makeUpdateFeature(deps),
		remove: makeDeleteFeature(deps),
		list: (projectId: string) => deps.features.list(projectId),
		find: (projectId: string, id: string) => deps.features.find(projectId, id)
	};
}

export type FeaturesModule = ReturnType<typeof createFeaturesModule>;
