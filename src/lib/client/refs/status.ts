import { MOSCOW_LABELS } from '$lib/modules/features/domain/feature';
import type { ElementSummary } from '$lib/modules/kernel/domain/element';
import { STATUS_LABELS } from '$lib/modules/tasks/domain/task';
import type { ProjectStore } from '../project-store.svelte';

/** Short live status for previews, read from the full element when it is loaded. */
export function statusOf(store: ProjectStore, element: ElementSummary): string | null {
	if (element.kind === 'task') {
		const task = store.tasks.get(element.id);
		return task ? STATUS_LABELS[task.status] : element.status;
	}
	if (element.kind === 'feature') {
		const feature = store.features.get(element.id);
		return feature ? MOSCOW_LABELS[feature.priority] : element.status;
	}
	if (element.kind === 'idea') return store.ideas.get(element.id)?.archivedAt ? 'Archivée' : null;
	return element.status;
}
