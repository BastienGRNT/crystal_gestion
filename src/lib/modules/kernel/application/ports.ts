import type { ActivityInput, NotificationInput } from '../domain/subject';

export interface Clock {
	now(): Date;
}

/** Broadcasts what changed so every open screen updates live. */
export interface ChangeFeed<Item> {
	saved(item: Item): void;
	removed(id: string): void;
}

export interface ActivityLog {
	record(entry: ActivityInput): Promise<void>;
}

export interface Notifier {
	notify(notification: NotificationInput): Promise<void>;
}

export const systemClock: Clock = { now: () => new Date() };
