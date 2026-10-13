import { page } from '$app/state';
import type { AppState } from '$lib/client/state/app.svelte';

/** The project of the current URL (`/p/[slug]/…`). */
export const currentProject = (app: AppState) =>
	app.projects.all.find((project) => project.slug === page.params.slug);

export const projectTasks = (app: AppState, projectId: string) =>
	app.tasks.all.filter((task) => task.projectId === projectId);
