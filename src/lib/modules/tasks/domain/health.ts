import { daysUntil } from '$lib/modules/kernel/domain/dates';
import { isActive, type Task } from './task';

export const STALE_AFTER_DAYS = 7;

export const isLate = (task: Task, today: Date) =>
	isActive(task) && task.dueDate !== null && daysUntil(task.dueDate, today) < 0;

/** Started or waiting for review, but untouched for a week: probably blocked. */
export const isStale = (task: Task, now: Date) =>
	(task.status === 'in_progress' || task.status === 'review') &&
	now.getTime() - Date.parse(task.updatedAt) > STALE_AFTER_DAYS * 86_400_000;
