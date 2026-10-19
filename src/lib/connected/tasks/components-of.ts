import type { AppState } from '$lib/client/state/app.svelte';
import { tint } from '$lib/client/labels';
import { activeComponents } from '$lib/modules/tasks/domain/component';

/** A project's modules in use, ready for pickers and chips. Shown only from two on. */
export function componentOptions(app: AppState, projectId: string) {
	return activeComponents(app.components.all.filter((c) => c.projectId === projectId)).map((c) => ({
		id: c.id,
		name: c.name,
		color: tint(c.color)
	}));
}

/** The chip of a task's module, when its project has several. */
export function componentChip(app: AppState, componentId: string | null) {
	const component = app.components.get(componentId);
	if (!component || component.archivedAt) return undefined;
	const siblings = app.components.all.filter(
		(c) => c.projectId === component.projectId && !c.archivedAt
	);
	return siblings.length > 1 ? { name: component.name, color: tint(component.color) } : undefined;
}

/** Names already typed in "Signalé par" in this project, to pick them again. */
export function reporters(app: AppState, projectId: string): string[] {
	const names = app.tasks.all
		.filter((t) => t.projectId === projectId && t.reportedBy)
		.map((t) => t.reportedBy!);
	return [...new Set(names)].sort((a, b) => a.localeCompare(b, 'fr'));
}
