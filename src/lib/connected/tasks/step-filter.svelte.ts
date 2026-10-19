import { SvelteMap } from 'svelte/reactivity';
import type { AppState } from '$lib/client/state/app.svelte';
import {
	currentStepOf,
	inScope,
	scopeStep,
	stepForScope,
	type StepScope
} from '$lib/client/views/roadmap';
import type { Task } from '$lib/modules/tasks/domain/task';

const KEY = 'crystal-step-filter';

function read(): Record<string, StepScope> {
	try {
		return JSON.parse(localStorage.getItem(KEY) ?? '{}');
	} catch {
		return {};
	}
}

/**
 * Which step the board and the matrix show, per project and remembered on this device. By
 * default, the step under way: the steps to come wait their turn without cluttering the board.
 */
class StepFilter {
	#scopes = new SvelteMap<string, StepScope>(Object.entries(read()));

	scope(app: AppState, projectId: string): StepScope {
		const scope = this.#scopes.get(projectId) ?? 'current';
		// A step deleted or closed since then would hide everything: back to the one under way.
		if (scope === 'current' || scope === 'all') return scope;
		const step = app.milestones.get(scope);
		return step && !step.closedAt ? scope : 'current';
	}

	set(projectId: string, scope: StepScope) {
		this.#scopes.set(projectId, scope);
		try {
			localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(this.#scopes)));
		} catch {
			// Not remembered in private mode, still applied.
		}
	}

	/** What the filter keeps, how a new task is placed, and the step cards are compared with. */
	view(app: AppState, projectId: string) {
		const scope = this.scope(app, projectId);
		const currentId = currentStepOf(app.milestones.all, projectId)?.id ?? null;
		const shown = scopeStep(scope, currentId);
		return {
			scope,
			apply: (tasks: Task[]) => tasks.filter((t) => inScope(t, scope, currentId)),
			newTaskStep: stepForScope(scope, currentId),
			/** Same, for a task created with that status (an idea stays out of the step under way). */
			stepFor: (status: Task['status']) => stepForScope(scope, currentId, status),
			/** The step's name on a card that belongs to another one than the step shown. */
			tagOf: (task: Task) =>
				task.milestoneId && task.milestoneId !== shown
					? app.milestones.get(task.milestoneId)?.title
					: undefined
		};
	}
}

export const stepFilter = new StepFilter();
