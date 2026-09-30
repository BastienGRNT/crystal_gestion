import type { RunningTimer } from '$lib/modules/time/domain/running-timer';
import type { Task, TaskFields, TaskStatus } from '../domain/task';

export interface NewTask extends TaskFields {
	projectId: string;
	status: TaskStatus;
	position: number;
	createdBy: string;
}

export type TaskChanges = Partial<TaskFields & Pick<Task, 'status' | 'position' | 'completedAt'>>;

export interface TaskRepository {
	create(task: NewTask): Promise<Task>;
	update(projectId: string, id: string, changes: TaskChanges): Promise<Task>;
	find(projectId: string, id: string): Promise<Task | null>;
	list(projectId: string): Promise<Task[]>;
	delete(projectId: string, id: string): Promise<void>;
	positions(projectId: string, status: TaskStatus): Promise<number[]>;
}

/** Implemented by the time module: a started task runs a timer for its owner. */
export interface TaskTimer {
	start(projectId: string, userId: string, taskId: string): Promise<RunningTimer | null>;
	stopForUser(userId: string): Promise<void>;
	stopForTask(taskId: string): Promise<void>;
}
