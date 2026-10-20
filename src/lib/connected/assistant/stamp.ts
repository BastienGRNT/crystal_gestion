import type { AppState } from '$lib/client/state/app.svelte';
import { storyRef } from '$lib/modules/framing/domain/framing';

/**
 * A cheap fingerprint of what the assistant reads of a project: when it has not moved since
 * the last proposal, asking again would only give the same answer.
 */
export function projectStamp(app: AppState, projectId: string): string {
	const own = <T extends { projectId: string }>(items: T[]) =>
		items.filter((i) => i.projectId === projectId);
	const tasks = own(app.tasks.all);
	const project = app.projects.get(projectId);
	return [
		tasks.length,
		tasks.reduce((max, t) => (t.updatedAt > max ? t.updatedAt : max), ''),
		project?.brief.length,
		project?.techSpec.length,
		project?.deadline,
		...own(app.milestones.all).map(
			(m) => `${m.title}${m.doneWhen.length}${m.targetDate}${m.closedAt}`
		),
		own(app.epics.all).length,
		own(app.stories.all)
			.map((s) => s.criteria.length + s.want.length)
			.join('.'),
		own(app.stakeholders.all).length,
		own(app.swot.all).length,
		own(app.strategies.all).length,
		own(app.hypotheses.all).length,
		own(app.metrics.all).length,
		own(app.components.all).length,
		own(app.initiatives.all).length
	].join('|');
}

/** What the screens call an item, for the review panel. */
export function nameOf(app: AppState, id: string): string | null {
	const task = app.tasks.get(id);
	if (task) return `#${task.number} ${task.title}`;
	const story = app.stories.get(id);
	if (story) return `${storyRef(story)} ${story.want}`;
	return (
		app.milestones.get(id)?.title ??
		app.epics.get(id)?.title ??
		app.components.get(id)?.name ??
		app.stakeholders.get(id)?.name ??
		app.initiatives.get(id)?.title ??
		app.swot.get(id)?.text ??
		app.metrics.get(id)?.name ??
		null
	);
}
