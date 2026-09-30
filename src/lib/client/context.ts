import { getContext, setContext } from 'svelte';
import type { User } from '$lib/modules/identity/domain/user';
import type { Actions } from './actions';
import type { ProjectStore } from './project-store.svelte';
import type { RealtimeClient } from './realtime/socket.svelte';
import type { RefTools } from './refs/ref-tools.svelte';

const KEY = Symbol('project');

export interface ProjectContext {
	store: ProjectStore;
	realtime: RealtimeClient;
	actions: Actions;
	refs: RefTools;
	me: User;
	/** Opens the side peek of any element (task, decision, idea, resource…). */
	peek: (ref: string) => void;
}

export const setProjectContext = (context: ProjectContext) => setContext(KEY, context);

/** The live project, its connection, actions and the current user, available to every project page. */
export const useProject = () => getContext<ProjectContext>(KEY);
