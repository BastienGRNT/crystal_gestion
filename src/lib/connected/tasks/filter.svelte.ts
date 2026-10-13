import type { Task } from '$lib/modules/tasks/domain/task';

const KEY = 'crystal-person-filter';

function read(): string | null {
	try {
		return localStorage.getItem(KEY);
	} catch {
		return null;
	}
}

/** Whose tasks the matrix and the board show; remembered on this device. */
class PersonFilter {
	value = $state<string | null>(read());

	set(value: string | null) {
		this.value = value;
		try {
			if (value) localStorage.setItem(KEY, value);
			else localStorage.removeItem(KEY);
		} catch {
			// Not remembered in private mode, still applied.
		}
	}

	apply(tasks: Task[]) {
		return this.value ? tasks.filter((t) => t.assigneeId === this.value) : tasks;
	}
}

export const personFilter = new PersonFilter();
