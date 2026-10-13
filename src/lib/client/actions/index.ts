import type { AppState } from '../state/app.svelte';
import { chatActions } from './chat';
import { fileActions } from './files.svelte';
import { peopleActions } from './people';
import { planningActions } from './planning';
import { projectActions } from './projects';
import { taskActions } from './tasks';
import { vaultActions } from './vault';

/** Every user action goes through here: shown at once, sent, undone if the server refuses. */
export function createActions(app: AppState) {
	return {
		tasks: taskActions(app),
		projects: projectActions(app),
		chat: chatActions(app),
		files: fileActions(app),
		vault: vaultActions(app),
		planning: planningActions(app),
		people: peopleActions(app)
	};
}

export type Actions = ReturnType<typeof createActions>;
