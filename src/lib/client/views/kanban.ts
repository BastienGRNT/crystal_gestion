import { positionBetween } from '$lib/modules/tasks/domain/position';
import type { Task } from '$lib/modules/tasks/domain/task';

export interface TaskFilter {
	person: string;
	feature: string;
	bugsOnly?: boolean;
}

export function matchesFilter(task: Task, { person, feature, bugsOnly }: TaskFilter) {
	if (person && !task.assigneeIds.includes(person)) return false;
	if (bugsOnly && !task.isFix) return false;
	if (feature === 'none') return task.featureId === null;
	return !feature || task.featureId === feature;
}

export const byPosition = (a: Task, b: Task) => a.position - b.position;

/** Position for a card dropped at `index` of a column (index counted with the card still in place). */
export function dropPosition(column: Task[], movedId: string, index: number): number {
	const from = column.findIndex((task) => task.id === movedId);
	const others = column.filter((task) => task.id !== movedId);
	const target = from !== -1 && from < index ? index - 1 : index;
	return positionBetween(others[target - 1]?.position, others[target]?.position);
}

/** Work of an archived feature is history: it leaves the board and the matrix. */
export const outsideArchive = (archivedIds: Set<string>) => (task: Task) =>
	!task.featureId || !archivedIds.has(task.featureId);
