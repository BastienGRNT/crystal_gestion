import type {
	Access,
	ActivityLog,
	ChangeFeed,
	Clock,
	Notifier
} from '../../kernel/application/ports';
import type { Task } from '../domain/task';

export interface TaskRepository {
	ofProjects(projectIds: string[]): Promise<Task[]>;
	get(id: string): Promise<Task | null>;
	insert(task: Task): Promise<void>;
	save(task: Task): Promise<void>;
	delete(id: string): Promise<void>;
	/** Atomic per project, so two people creating at once never get the same `#12`. */
	nextNumber(projectId: string): Promise<number>;
	lastPosition(projectId: string): Promise<number | null>;
}

export interface TaskDeps {
	tasks: TaskRepository;
	access: Access;
	clock: Clock;
	feed: ChangeFeed<Task>;
	activity: ActivityLog;
	notifier: Notifier;
}
