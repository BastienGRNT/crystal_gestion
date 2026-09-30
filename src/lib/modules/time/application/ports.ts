import type { RunningTimer } from '../domain/running-timer';
import type { TimeEntry } from '../domain/time-entry';

export type NewTimeEntry = Omit<TimeEntry, 'id'>;
export type TimeEntryChanges = Partial<Pick<TimeEntry, 'startedAt' | 'endedAt' | 'taskId'>>;

export interface TimeEntryRepository {
	create(entry: NewTimeEntry): Promise<TimeEntry>;
	update(id: string, changes: TimeEntryChanges): Promise<TimeEntry>;
	delete(id: string): Promise<void>;
	findOwned(id: string, userId: string): Promise<TimeEntry | null>;
	runningForUser(userId: string): Promise<TimeEntry[]>;
	runningForTask(taskId: string): Promise<TimeEntry[]>;
	list(projectId: string): Promise<TimeEntry[]>;
}

export interface RunningTimerQuery {
	forUser(userId: string): Promise<RunningTimer | null>;
}

/** Pushes a person's timer to all their open tabs, whatever project they are looking at. */
export interface TimerFeed {
	changed(userId: string, timer: RunningTimer | null): void;
}
