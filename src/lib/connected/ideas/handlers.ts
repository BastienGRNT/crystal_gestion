import { goto } from '$app/navigation';
import type { ProjectContext } from '$lib/client/context';
import { projectPath } from '$lib/client/navigation';
import type { IdeaHandlers } from '$lib/ui/organisms/ideas/handlers';

/** Idea actions; a converted idea opens its new element right away so it can be fleshed out. */
export function ideaHandlers(context: ProjectContext, id: string): IdeaHandlers {
	const { store, actions, peek } = context;
	return {
		ontask: async () => {
			const task = await actions.ideas.toTask(id);
			if (task) peek(task.ref);
		},
		onfeature: async () => {
			const feature = await actions.ideas.toFeature(id);
			if (feature) goto(projectPath(store.project.slug, `/features/${feature.ref}`));
		},
		onarchive: (archived) => actions.ideas.archive(id, archived),
		onkeep: () => actions.ideas.keep(id),
		onremove: () => actions.ideas.remove(id)
	};
}
