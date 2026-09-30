import type { ElementBase } from '$lib/modules/kernel/domain/element';

export const TASK_STATUSES = ['todo', 'in_progress', 'review', 'done'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const STATUS_LABELS: Record<TaskStatus, string> = {
	todo: 'À faire',
	in_progress: 'En cours',
	review: 'À valider',
	done: 'Fait'
};

export interface TaskFields {
	title: string;
	description: string;
	featureId: string | null;
	dueDate: string | null;
	/** Manual override of the importance derived from the feature priority. */
	important: boolean | null;
	/** Manual override of the urgency derived from the due date (set by moving the task in the matrix). */
	urgent: boolean | null;
	assigneeIds: string[];
}

export interface Task extends ElementBase, TaskFields {
	kind: 'task';
	projectId: string;
	status: TaskStatus;
	position: number;
	completedAt: string | null;
	createdAt: string;
	updatedAt: string;
}

export const isDone = (task: Pick<Task, 'status'>) => task.status === 'done';
export const isAssignedTo = (task: Pick<Task, 'assigneeIds'>, userId: string) =>
	task.assigneeIds.includes(userId);
