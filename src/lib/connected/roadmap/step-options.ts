import type { AppState } from '$lib/client/state/app.svelte';
import { projectMilestones } from '$lib/client/views/roadmap';
import type { StepOption } from '$lib/ui/types';

/** The steps a task can join: the open ones, in order, the one under way flagged. */
export function stepOptions(app: AppState, projectId: string): StepOption[] {
	const open = projectMilestones(app.milestones.all, projectId).filter((m) => !m.closedAt);
	return open.map((m, i) => ({ id: m.id, title: m.title, current: i === 0 }));
}
