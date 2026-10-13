import type { ActivityLog, ChangeFeed, Clock, Notifier } from '../../kernel/application/ports';
import type { Task } from '../domain/task';

export interface TaskRepository {
	list(): Promise<Task[]>;
	get(id: string): Promise<Task | null>;
	insert(task: Task): Promise<void>;
	save(task: Task): Promise<void>;
	delete(id: string): Promise<void>;
	/** Atomic per project, so two people creating at once never get the same `#12`. */
	nextNumber(projectId: string): Promise<number>;
	lastPosition(projectId: string): Promise<number | null>;
}

/** What tasks need to know about projects and people, without depending on their modules. */
export interface Directory {
	projectExists(id: string): Promise<boolean>;
	userExists(id: string): Promise<boolean>;
}

export interface TaskDeps {
	tasks: TaskRepository;
	directory: Directory;
	clock: Clock;
	feed: ChangeFeed<Task>;
	activity: ActivityLog;
	notifier: Notifier;
}
