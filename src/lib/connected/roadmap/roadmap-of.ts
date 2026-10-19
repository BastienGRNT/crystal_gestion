import type { AppState } from '$lib/client/state/app.svelte';
import { projectMilestones, stepForecasts } from '$lib/client/views/roadmap';
import { startOfWeek, type DateKey } from '$lib/modules/kernel/domain/dates';
import { tracking } from '$lib/modules/roadmap/domain/metric';
import { currentMilestone } from '$lib/modules/roadmap/domain/milestone';
import type { Project } from '$lib/modules/projects/domain/project';
import { projectTasks } from '../projects/current.svelte';

/** A project's steps, the one under way and where each stands, read from the live store. */
export function roadmapOf(app: AppState, projectId: string, today: DateKey, now: Date) {
	const steps = projectMilestones(app.milestones.all, projectId);
	const forecasts = stepForecasts(steps, projectTasks(app, projectId), today, now);
	const current = currentMilestone(steps);
	return {
		steps,
		forecasts,
		current,
		currentForecast: current ? forecasts.get(current.id) : undefined
	};
}

export const readingsOf = (app: AppState, projectId: string) =>
	app.readings.all.filter((r) => r.projectId === projectId);

/** The number is tracked and this week's value is still missing. */
export function metricMissing(app: AppState, project: Project, today: DateKey) {
	const readings = readingsOf(app, project.id);
	return (
		!!project.metricName &&
		tracking(readings) &&
		!readings.some((r) => r.weekOf === startOfWeek(today))
	);
}

export const roadmapHref = (slug: string, anchor = '') =>
	`/p/${slug}/feuille-de-route${anchor ? `#${anchor}` : ''}`;
