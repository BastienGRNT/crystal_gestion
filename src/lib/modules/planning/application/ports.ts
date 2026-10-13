import type { Access, ChangeFeed, Clock } from '../../kernel/application/ports';
import type { AvailabilitySlot, WorkBlock } from '../domain/availability';

export interface SlotRepository {
	ofUsers(userIds: string[], since: Date): Promise<AvailabilitySlot[]>;
	get(id: string): Promise<AvailabilitySlot | null>;
	insert(slot: AvailabilitySlot): Promise<void>;
	save(slot: AvailabilitySlot): Promise<void>;
	delete(id: string): Promise<void>;
}

export interface BlockRepository {
	ofProjects(projectIds: string[], since: Date): Promise<WorkBlock[]>;
	get(id: string): Promise<WorkBlock | null>;
	insert(block: WorkBlock): Promise<void>;
	save(block: WorkBlock): Promise<void>;
	delete(id: string): Promise<void>;
}

/** A task's project, to keep blocks and tasks in the same project. */
export interface TaskProjects {
	projectOf(taskId: string): Promise<string | null>;
}

export interface PlanningDeps {
	slots: SlotRepository;
	blocks: BlockRepository;
	tasks: TaskProjects;
	access: Access;
	clock: Clock;
	slotFeed: ChangeFeed<AvailabilitySlot>;
	blockFeed: ChangeFeed<WorkBlock>;
}
