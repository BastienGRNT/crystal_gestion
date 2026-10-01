import type { NewTask } from '../actions/tasks';
import type { ProjectStore } from '../project-store.svelte';
import { parseQuickEntry } from './quick-entry';

/** A line typed in a list becomes a task, with what the place and the line say. */
export function quickTask(store: ProjectStore, text: string, defaults: Partial<NewTask>): NewTask {
	const parsed = parseQuickEntry(text, {
		features: store.features.items,
		members: store.members.items,
		today: new Date()
	});
	return {
		...defaults,
		title: parsed.title || text,
		...(parsed.featureId ? { featureId: parsed.featureId } : {}),
		...(parsed.assigneeIds.length ? { assigneeIds: parsed.assigneeIds } : {}),
		...(parsed.dueDate ? { dueDate: parsed.dueDate } : {})
	};
}
