import type { ActivityInput, NotificationInput } from '../domain/subject';

export interface Clock {
	now(): Date;
}

/** Broadcasts what changed so every open screen of the people concerned updates live. */
export interface ChangeFeed<Item> {
	saved(item: Item): void;
	removed(item: Item): void;
}

export interface ActivityLog {
	record(entry: ActivityInput): Promise<void>;
}

export interface Notifier {
	notify(notification: NotificationInput): Promise<void>;
}

/** Everything in a project is for its members only. */
export interface Access {
	assertMember(projectId: string, userId: string): Promise<void>;
	isMember(projectId: string, userId: string): Promise<boolean>;
	members(projectId: string): Promise<string[]>;
}

export const systemClock: Clock = { now: () => new Date() };
