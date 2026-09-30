import type {
	ActivityLog,
	ChangeFeed,
	Clock,
	ReferenceSync
} from '$lib/modules/kernel/application/ports';
import type { Actor } from '$lib/modules/kernel/domain/actor';
import type { FeatureFields } from '../domain/feature';
import { isAfterFraming } from '../domain/scope';
import type { FeatureRepository, ProjectClock, ScopeLog } from './ports';

interface Deps {
	features: FeatureRepository;
	scopeLog: ScopeLog;
	projectClock: ProjectClock;
	feed: ChangeFeed;
	activity: ActivityLog;
	references: ReferenceSync;
	clock: Clock;
}

export type NewFeature = Pick<FeatureFields, 'title'> &
	Partial<FeatureFields> & { projectId: string };

export const makeCreateFeature = (deps: Deps) => async (actor: Actor, input: NewFeature) => {
	const feature = await deps.features.create({
		description: '',
		priority: 'should',
		ownerId: null,
		doneCriteria: '',
		...input,
		createdBy: actor.id
	});
	deps.feed.upserted('feature', feature.projectId, feature);
	await deps.references.sync(feature.projectId, feature.id, [
		feature.description,
		feature.doneCriteria
	]);
	await deps.activity.record({
		projectId: feature.projectId,
		actor,
		verb: 'created',
		element: feature
	});
	const createdAt = await deps.projectClock.projectCreatedAt(feature.projectId);
	if (isAfterFraming(createdAt, deps.clock.now()))
		await deps.scopeLog.record(actor, feature, { change: 'added', priority: feature.priority });
	return feature;
};
