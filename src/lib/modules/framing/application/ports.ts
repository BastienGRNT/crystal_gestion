import type { Access, ChangeFeed, Clock } from '../../kernel/application/ports';
import type { Task, TaskStatus } from '../../tasks/domain/task';
import type {
	Epic,
	Initiative,
	Journey,
	Stakeholder,
	Story,
	Strategy,
	SwotItem,
	Term
} from '../domain/framing';

export interface Store<Item> {
	ofProjects(projectIds: string[]): Promise<Item[]>;
	ofProject(projectId: string): Promise<Item[]>;
	get(id: string): Promise<Item | null>;
	/** Inserts or replaces. */
	put(item: Item): Promise<void>;
	delete(id: string): Promise<void>;
}

/** The tasks a story or an epic gathers: they follow when it goes away or is postponed. */
export interface TaskGateway {
	ofProject(projectId: string): Promise<Task[]>;
	/** A task the actor may see. */
	get(id: string, actorId: string): Promise<Task>;
	update(
		id: string,
		patch: { storyId?: string | null; epicId?: string | null; status?: TaskStatus },
		actorId: string
	): Promise<Task>;
}

/** What the framing points at in other modules. */
export interface Neighbours {
	/** The project an item of another module belongs to, or null when it does not exist. */
	projectOf(kind: 'metric' | 'hypothesis' | 'component', id: string): Promise<string | null>;
	createHypothesis(projectId: string, text: string, actorId: string): Promise<{ id: string }>;
	decide(projectId: string, text: string, why: string, actorId: string): Promise<void>;
}

export interface FramingItems {
	initiatives: Initiative;
	epics: Epic;
	stories: Story;
	stakeholders: Stakeholder;
	journeys: Journey;
	terms: Term;
	swot: SwotItem;
	strategies: Strategy;
}

export type FramingStores = { [K in keyof FramingItems]: Store<FramingItems[K]> };
export type FramingFeeds = { [K in keyof FramingItems]: ChangeFeed<FramingItems[K]> };
export type ItemOf<K extends keyof FramingItems> = FramingItems[K];

export interface FramingDeps {
	stores: FramingStores;
	feeds: FramingFeeds;
	/** Atomic per project, like task numbers: `US-7` never repeats. */
	nextStoryNumber(projectId: string): Promise<number>;
	tasks: TaskGateway;
	neighbours: Neighbours;
	access: Access;
	clock: Clock;
	newId(): string;
}
