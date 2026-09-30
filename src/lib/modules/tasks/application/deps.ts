import type {
	ActivityLog,
	ChangeFeed,
	Clock,
	Notifier,
	ReferenceSync
} from '$lib/modules/kernel/application/ports';
import type { TaskRepository, TaskTimer } from './ports';

export interface TaskDeps {
	tasks: TaskRepository;
	timer: TaskTimer;
	feed: ChangeFeed;
	activity: ActivityLog;
	notifier: Notifier;
	references: ReferenceSync;
	clock: Clock;
}

export interface TaskTarget {
	projectId: string;
	id: string;
}
