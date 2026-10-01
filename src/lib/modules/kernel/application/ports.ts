import type { Actor } from '../domain/actor';
import type { ElementBase } from '../domain/element';
import type { EntityName } from '../domain/realtime';

export interface Clock {
	now(): Date;
}

/** Pushes state changes to connected clients. */
export interface ChangeFeed {
	upserted(entity: EntityName, projectId: string, data: unknown): void;
	deleted(entity: EntityName, projectId: string, id: string): void;
}

export type ActivityVerb =
	'created' | 'updated' | 'moved' | 'completed' | 'archived' | 'deleted' | 'posted';

export interface ActivityInput {
	projectId: string;
	actor: Actor;
	verb: ActivityVerb;
	element: ElementBase;
	details?: Record<string, string>;
}

export interface ActivityLog {
	record(input: ActivityInput): Promise<void>;
}

export type NotificationType = 'mention' | 'question' | 'assigned' | 'review';

export interface NotificationInput {
	type: NotificationType;
	projectId: string;
	actor: Actor;
	element: ElementBase;
	recipientIds: string[];
}

export interface Notifier {
	notify(input: NotificationInput): Promise<void>;
}

/** Keeps free `#REF` references of an element's texts in sync. */
export interface ReferenceSync {
	sync(projectId: string, sourceId: string, texts: string[]): Promise<void>;
}
