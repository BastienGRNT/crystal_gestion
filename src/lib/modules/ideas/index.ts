import { makeElementCrud, type ElementStore } from '$lib/modules/kernel/application/element-crud';
import type {
	ActivityLog,
	ChangeFeed,
	Clock,
	ReferenceSync
} from '$lib/modules/kernel/application/ports';
import type { Actor } from '$lib/modules/kernel/domain/actor';
import { makeConvertToFeature, makeConvertToTask } from './application/convert-idea';
import type { IdeaConverters } from './application/ports';
import type { Idea, IdeaFields } from './domain/idea';

export function createIdeasModule(deps: {
	store: ElementStore<Idea, IdeaFields>;
	converters: IdeaConverters;
	feed: ChangeFeed;
	activity: ActivityLog;
	references: ReferenceSync;
	clock: Clock;
}) {
	const ideas = makeElementCrud({ ...deps, entity: 'idea', textsOf: (idea: Idea) => [idea.note] });
	const stamp = (on: boolean) => (on ? deps.clock.now().toISOString() : null);
	type Target = { projectId: string; id: string };
	return {
		...ideas,
		archive: (actor: Actor, { archived, ...target }: Target & { archived: boolean }) =>
			ideas.update(actor, { ...target, changes: { archivedAt: stamp(archived) } }),
		keep: (actor: Actor, target: Target) =>
			ideas.update(actor, { ...target, changes: { triagedAt: stamp(true) } }),
		convertToTask: makeConvertToTask({ ideas, converters: deps.converters }),
		convertToFeature: makeConvertToFeature({ ideas, converters: deps.converters })
	};
}

export type IdeasModule = ReturnType<typeof createIdeasModule>;
