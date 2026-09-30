import type { ElementCrud, Target } from '$lib/modules/kernel/application/element-crud';
import type { Actor } from '$lib/modules/kernel/domain/actor';
import type { Idea, IdeaFields } from '../domain/idea';
import type { IdeaConverters } from './ports';

type Deps = { ideas: ElementCrud<Idea, IdeaFields>; converters: IdeaConverters };

const origin = (idea: Idea) =>
	[idea.note, `Depuis l’idée « ${idea.title} ».`].filter(Boolean).join('\n\n');

export const makeConvertToTask = (deps: Deps) => async (actor: Actor, target: Target) => {
	const idea = await deps.ideas.find(target);
	const task = await deps.converters.createTask(actor, {
		projectId: idea.projectId,
		title: idea.title,
		description: origin(idea),
		featureId: idea.featureId
	});
	await deps.ideas.remove(actor, target);
	return task;
};

export const makeConvertToFeature = (deps: Deps) => async (actor: Actor, target: Target) => {
	const idea = await deps.ideas.find(target);
	const feature = await deps.converters.createFeature(actor, {
		projectId: idea.projectId,
		title: idea.title,
		description: origin(idea),
		priority: 'could'
	});
	await deps.ideas.remove(actor, target);
	return feature;
};
