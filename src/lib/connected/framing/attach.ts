import type { AppState } from '$lib/client/state/app.svelte';
import { storyRef } from '$lib/modules/framing/domain/framing';

/** What a task can be attached to: the epics in scope, then the stories, in their order. */
export function attachOptions(app: AppState, projectId: string) {
	const epics = app.epics.all
		.filter((e) => e.projectId === projectId && !e.later)
		.sort((a, b) => a.position - b.position)
		.map((e) => ({ kind: 'epic' as const, id: e.id, label: `Epic · ${e.title}` }));
	const stories = app.stories.all
		.filter((s) => s.projectId === projectId)
		.sort((a, b) => a.number - b.number)
		.map((s) => ({ kind: 'story' as const, id: s.id, label: `${storyRef(s)} · ${s.want}` }));
	return [...epics, ...stories];
}

/** `^` in a quick entry finds these. */
export function framingTargets(app: AppState, projectId: string) {
	return [
		...app.epics.all
			.filter((e) => e.projectId === projectId && !e.later)
			.map((e) => ({ id: e.id, kind: 'epic' as const, name: e.title })),
		...app.stories.all
			.filter((s) => s.projectId === projectId)
			.map((s) => ({ id: s.id, kind: 'story' as const, name: s.want, number: s.number }))
	];
}

/** "Initiative › Epic › US-7": where a task comes from, for its sheet and its card. */
export function framingTrail(
	app: AppState,
	task: { storyId: string | null; epicId: string | null }
) {
	const story = app.stories.get(task.storyId);
	const epic = app.epics.get(story ? story.epicId : task.epicId);
	const initiative = app.initiatives.get(epic?.initiativeId);
	return { story, epic, initiative };
}

/** The card's chip: "Réservation · US-7", or the epic alone. */
export function framingChip(
	app: AppState,
	task: { storyId: string | null; epicId: string | null }
): string | undefined {
	const { story, epic } = framingTrail(app, task);
	if (story) return epic ? `${epic.title} · ${storyRef(story)}` : storyRef(story);
	return epic?.title;
}
