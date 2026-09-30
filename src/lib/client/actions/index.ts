import type { ProjectStore } from '../project-store.svelte';
import { discussionActions } from './discussion';
import { featureActions } from './features';
import { fileActions } from './files';
import { ideaActions } from './ideas';
import { journalActions } from './journal';
import { planningActions } from './planning';
import { projectActions } from './project';
import { resourceActions } from './resources';
import { taskActions } from './tasks';

/** Every user intent of a project page: optimistic locally, then confirmed by a command. */
export function createActions(store: ProjectStore, meId: string) {
	return {
		project: projectActions(store, meId),
		features: featureActions(store),
		tasks: taskActions(store, meId),
		ideas: ideaActions(store, meId),
		journal: journalActions(store, meId),
		discussion: discussionActions(store, meId),
		planning: planningActions(store, meId),
		resources: resourceActions(store),
		files: fileActions(store)
	};
}

export type Actions = ReturnType<typeof createActions>;
