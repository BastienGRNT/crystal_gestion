import type { AppState } from '$lib/client/state/app.svelte';
import { projectMilestones, stepForecasts } from '$lib/client/views/roadmap';
import { missingThisWeek } from '$lib/client/views/metrics';
import type { DateKey } from '$lib/modules/kernel/domain/dates';
import { currentMilestone } from '$lib/modules/roadmap/domain/milestone';
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

export const metricsOf = (app: AppState, projectId: string) =>
	app.metrics.all.filter((m) => m.projectId === projectId);

/** The numbers already followed whose value of this week is still missing. */
export const missingMetrics = (app: AppState, projectId: string, today: DateKey) =>
	missingThisWeek(metricsOf(app, projectId), readingsOf(app, projectId), today);

export const roadmapHref = (slug: string, anchor = '') =>
	`/p/${slug}/feuille-de-route${anchor ? `#${anchor}` : ''}`;
