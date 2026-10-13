import type { ChangeFeed, Clock } from '../../kernel/application/ports';
import type { DateKey } from '../../kernel/domain/dates';
import type { Availability, Slot } from '../domain/availability';

export interface AvailabilityRepository {
	/** Everyone's usual week, and their exceptions from `since` on. */
	all(since: DateKey): Promise<Availability[]>;
	get(userId: string, since: DateKey): Promise<Availability>;
	setWeekday(userId: string, weekday: number, slots: Slot[]): Promise<void>;
	setOverride(userId: string, date: DateKey, slots: Slot[]): Promise<void>;
	clearOverride(userId: string, date: DateKey): Promise<void>;
}

export interface PlanningDeps {
	availability: AvailabilityRepository;
	clock: Clock;
	feed: ChangeFeed<Availability>;
}
