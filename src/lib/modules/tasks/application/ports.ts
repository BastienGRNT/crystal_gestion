import type {
	Access,
	ActivityLog,
	ChangeFeed,
	Clock,
	Notifier
} from '../../kernel/application/ports';
import type { Component } from '../domain/component';
import type { Task } from '../domain/task';

export interface TaskRepository {
	ofProjects(projectIds: string[]): Promise<Task[]>;
	ofMilestone(milestoneId: string): Promise<Task[]>;
	ofRelease(releaseId: string): Promise<Task[]>;
	get(id: string): Promise<Task | null>;
	insert(task: Task): Promise<void>;
	save(task: Task): Promise<void>;
	delete(id: string): Promise<void>;
	/** Atomic per project, so two people creating at once never get the same `#12`. */
	nextNumber(projectId: string): Promise<number>;
	lastPosition(projectId: string): Promise<number | null>;
}

/** The steps of the roadmap, as far as a task needs to know them. */
export interface MilestoneLookup {
	get(id: string): Promise<{ projectId: string; closedAt: string | null } | null>;
	/** The step under way of a project: where reopened work goes. */
	current(projectId: string): Promise<string | null>;
}

export interface ComponentRepository {
	ofProjects(projectIds: string[]): Promise<Component[]>;
	ofProject(projectId: string): Promise<Component[]>;
	get(id: string): Promise<Component | null>;
	put(component: Component): Promise<void>;
	delete(id: string): Promise<void>;
}

export interface TaskDeps {
	tasks: TaskRepository;
	components: ComponentRepository;
	componentFeed: ChangeFeed<Component>;
	milestones: MilestoneLookup;
	access: Access;
	clock: Clock;
	feed: ChangeFeed<Task>;
	activity: ActivityLog;
	notifier: Notifier;
}
