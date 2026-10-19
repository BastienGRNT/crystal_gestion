import type { Access, ActivityLog, ChangeFeed, Clock } from '../../kernel/application/ports';
import type { ChecklistItem, Task, TaskStatus } from '../../tasks/domain/task';
import type { Decision } from '../domain/decision';
import type { Hypothesis } from '../domain/hypothesis';
import type { Metric, MetricReading } from '../domain/metric';
import type { Release } from '../domain/release';
import type { Milestone } from '../domain/milestone';

export interface Store<Item> {
	ofProjects(projectIds: string[]): Promise<Item[]>;
	ofProject(projectId: string): Promise<Item[]>;
	get(id: string): Promise<Item | null>;
	/** Inserts or replaces. */
	put(item: Item): Promise<void>;
	delete(id: string): Promise<void>;
}

/** What the roadmap needs from the tasks module: they are the work a step is made of. */
export interface TaskGateway {
	ofMilestone(milestoneId: string): Promise<Task[]>;
	ofRelease(releaseId: string): Promise<Task[]>;
	/** The modules of a project by id, to name them in a changelog. */
	componentNames(projectId: string): Promise<Map<string, string>>;
	get(id: string, actorId: string): Promise<Task>;
	create(
		input: {
			id: string;
			projectId: string;
			title: string;
			milestoneId: string | null;
			checklist?: ChecklistItem[];
		},
		actorId: string
	): Promise<Task>;
	move(
		id: string,
		patch: { milestoneId?: string | null; status?: TaskStatus; releaseId?: string | null },
		actorId: string
	): Promise<Task>;
}

export interface ChannelGateway {
	/** Opens a channel of that name unless it exists already. */
	ensure(projectId: string, name: string, actorId: string): Promise<void>;
}

export interface MessageGateway {
	projectOf(messageId: string): Promise<string | null>;
}

export interface RoadmapDeps {
	milestones: Store<Milestone>;
	decisions: Store<Decision>;
	hypotheses: Store<Hypothesis>;
	metrics: Store<Metric>;
	readings: Store<MetricReading>;
	releases: Store<Release>;
	tasks: TaskGateway;
	channels: ChannelGateway;
	messages: MessageGateway;
	access: Access;
	clock: Clock;
	milestoneFeed: ChangeFeed<Milestone>;
	decisionFeed: ChangeFeed<Decision>;
	hypothesisFeed: ChangeFeed<Hypothesis>;
	metricFeed: ChangeFeed<Metric>;
	readingFeed: ChangeFeed<MetricReading>;
	releaseFeed: ChangeFeed<Release>;
	activity: ActivityLog;
	newId(): string;
}
