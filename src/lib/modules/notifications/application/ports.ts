import type { Notification } from '../domain/notification';

export type NewNotification = Omit<Notification, 'id' | 'createdAt' | 'readAt'>;

export interface NotificationRepository {
	insertMany(notifications: NewNotification[]): Promise<Notification[]>;
	listForUser(userId: string, projectId: string, limit: number): Promise<Notification[]>;
	markRead(userId: string, projectId: string, at: Date): Promise<void>;
}

/** Delivers a notification to a user's open sessions, whatever the transport. */
export interface NotificationPusher {
	push(notification: Notification): void;
}
