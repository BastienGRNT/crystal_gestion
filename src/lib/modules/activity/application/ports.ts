import type { Access, ChangeFeed, Clock } from '../../kernel/application/ports';
import type { Activity, Notification, ProjectVisit } from '../domain/activity';

export interface ActivityRepository {
	insert(activity: Activity): Promise<void>;
	/** The latest lines of each project. */
	recent(projectIds: string[], perProject: number): Promise<Activity[]>;
}

export interface NotificationRepository {
	insert(notification: Notification): Promise<void>;
	forUser(userId: string, limit: number): Promise<Notification[]>;
	/** Marks the given ones (or all) as read and returns what changed. */
	markRead(userId: string, ids: string[] | 'all', at: Date): Promise<Notification[]>;
}

export interface VisitRepository {
	of(userId: string): Promise<ProjectVisit[]>;
	save(visit: ProjectVisit): Promise<void>;
}

/** Notifications go to their person only, never to the whole team. */
export interface Inbox {
	deliver(notification: Notification): void;
}

export interface ActivityDeps {
	activities: ActivityRepository;
	notifications: NotificationRepository;
	visits: VisitRepository;
	access: Access;
	clock: Clock;
	feed: ChangeFeed<Activity>;
	inbox: Inbox;
	/** A catch-up reaches my other open screens. */
	visitFeed: ChangeFeed<ProjectVisit>;
}
