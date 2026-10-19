import { goto } from '$app/navigation';
import { page } from '$app/state';
import type { DecisionSeed } from './actions/roadmap';
import type { TaskDraft } from './actions/tasks';

export type CreateRequest =
	| { kind: 'task'; seed: Partial<TaskDraft> }
	| { kind: 'project' }
	| { kind: 'channel'; projectId: string }
	| { kind: 'invite'; projectId: string }
	| { kind: 'vault'; projectId: string; entryId?: string }
	| { kind: 'decision'; seed: DecisionSeed };

export const TASK_PARAM = 'tache';

/** Dialogs and panels on top of the page. The open task lives in the URL so it can be shared. */
export class Overlays {
	palette = $state(false);
	create = $state<CreateRequest | null>(null);
	previewFileId = $state<string | null>(null);
	sidebar = $state(false);

	get taskId() {
		return page.url.searchParams.get(TASK_PARAM);
	}

	openTask(id: string) {
		const url = new URL(page.url);
		url.searchParams.set(TASK_PARAM, id);
		void goto(url, { noScroll: true, keepFocus: true });
	}

	closeTask() {
		const url = new URL(page.url);
		url.searchParams.delete(TASK_PARAM);
		void goto(url, { noScroll: true, keepFocus: true, replaceState: true });
	}

	newTask(seed: Partial<TaskDraft> = {}) {
		this.create = { kind: 'task', seed };
	}

	/** "C'est décidé": from a message, a task, a step or the roadmap. */
	decide(seed: DecisionSeed) {
		this.create = { kind: 'decision', seed };
	}
}
