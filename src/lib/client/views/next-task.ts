import { PRIORITY_ORDER } from '$lib/modules/tasks/domain/views';
import type { Task } from '$lib/modules/tasks/domain/task';
import { waitsForLaterStep } from './roadmap';

/**
 * What to pick up next: the step under way first, then mine, then what nobody holds yet; the
 * matrix decides the order, then the closest deadline. Blocked tasks wait.
 */
export function nextTasks(
	tasks: Task[],
	meId: string,
	currentStepId: string | null = null
): Task[] {
	const later = (t: Task) => Number(waitsForLaterStep(t, currentStepId));
	const due = (t: Task) => t.dueDate ?? '9999-12-31';
	return tasks
		.filter(
			(t) =>
				t.status === 'todo' && !t.blockedReason && (t.assigneeId === meId || t.assigneeId === null)
		)
		.sort(
			(a, b) =>
				later(a) - later(b) ||
				Number(b.assigneeId === meId) - Number(a.assigneeId === meId) ||
				PRIORITY_ORDER.indexOf(a.quadrant) - PRIORITY_ORDER.indexOf(b.quadrant) ||
				due(a).localeCompare(due(b)) ||
				a.position - b.position
		);
}
