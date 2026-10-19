import type { Task, TaskKind } from '$lib/modules/tasks/domain/task';

const KEY = 'crystal-kind-filter';

function read(): TaskKind | null {
	try {
		return (localStorage.getItem(KEY) as TaskKind | null) ?? null;
	} catch {
		return null;
	}
}

/**
 * Which kind of work and which module the board and the matrix show ("Bugs seulement").
 * The kind is remembered on this device; the module, tied to a project, is not.
 */
class WorkFilter {
	kind = $state<TaskKind | null>(read());
	componentId = $state<string | null>(null);

	setKind(kind: TaskKind | null) {
		this.kind = kind;
		try {
			if (kind) localStorage.setItem(KEY, kind);
			else localStorage.removeItem(KEY);
		} catch {
			// Not remembered in private mode, still applied.
		}
	}

	apply(tasks: Task[]) {
		return tasks.filter(
			(t) =>
				(!this.kind || t.kind === this.kind) &&
				(!this.componentId || t.componentId === this.componentId)
		);
	}
}

export const workFilter = new WorkFilter();
