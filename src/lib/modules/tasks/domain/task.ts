import type { ElementBase } from '$lib/modules/kernel/domain/element';

/** « Icebox » holds what is noted but deliberately not thought about yet. */
export const TASK_STATUSES = ['icebox', 'todo', 'in_progress', 'review', 'done'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const STATUS_LABELS: Record<TaskStatus, string> = {
	icebox: 'Icebox',
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
	/** A Fix: something to correct, inside a feat or not. */
	isFix: boolean;
	/** Who checks the work: ticking the task sends it to « À valider » for them. */
	reviewerId: string | null;
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
/** Neither done nor in the icebox: something someone should be working on. */
export const isActive = (task: Pick<Task, 'status'>) =>
	task.status !== 'done' && task.status !== 'icebox';
/**
 * Where ticking a task sends it: to its reviewer first (« À valider »), unless the reviewer is the
 * one ticking, or it is already waiting for them. Without reviewer, straight to « Fait ».
 */
export const finishedStatus = (
	task: Pick<Task, 'status' | 'reviewerId'>,
	actorId: string
): TaskStatus =>
	task.reviewerId && task.status !== 'review' && task.reviewerId !== actorId ? 'review' : 'done';

export const isAssignedTo = (task: Pick<Task, 'assigneeIds'>, userId: string) =>
	task.assigneeIds.includes(userId);
