import type { ChangeFeed, Clock } from '../../kernel/application/ports';
import type { Activity, Notification } from '../domain/activity';

export interface ActivityRepository {
	insert(activity: Activity): Promise<void>;
	recent(limit: number): Promise<Activity[]>;
}

export interface NotificationRepository {
	insert(notification: Notification): Promise<void>;
	forUser(userId: string, limit: number): Promise<Notification[]>;
	/** Marks the given ones (or all) as read and returns what changed. */
	markRead(userId: string, ids: string[] | 'all', at: Date): Promise<Notification[]>;
}

/** Notifications go to their person only, never to the whole team. */
export interface Inbox {
	deliver(notification: Notification): void;
}

export interface ActivityDeps {
	activities: ActivityRepository;
	notifications: NotificationRepository;
	clock: Clock;
	feed: ChangeFeed<Activity>;
	inbox: Inbox;
}
