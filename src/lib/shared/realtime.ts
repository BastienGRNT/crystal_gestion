/** The live contract between the server and every open screen. Isomorphic, types only. */
import type { Activity, Notification } from '$lib/modules/activity/domain/activity';
import type { Channel, Message } from '$lib/modules/chat/domain/chat';
import type { StoredFile } from '$lib/modules/files/domain/file';
import type { User } from '$lib/modules/identity/domain/user';
import type { Availability } from '$lib/modules/planning/domain/availability';
import type { Project } from '$lib/modules/projects/domain/project';
import type { Task } from '$lib/modules/tasks/domain/task';
import type { VaultEntry } from '$lib/modules/vault/domain/entry';

export interface Collections {
	users: User;
	projects: Project;
	tasks: Task;
	channels: Channel;
	messages: Message;
	files: StoredFile;
	vault: VaultEntry;
	availability: Availability;
	activities: Activity;
	notifications: Notification;
}

export type CollectionName = keyof Collections;

export type SavedEvent = {
	[K in CollectionName]: { type: 'saved'; collection: K; item: Collections[K] };
}[CollectionName];

export type ServerEvent =
	| SavedEvent
	| { type: 'removed'; collection: CollectionName; id: string }
	| { type: 'presence'; online: string[] }
	| { type: 'typing'; userId: string; channelId: string };

export type ClientEvent = { type: 'ping' } | { type: 'typing'; channelId: string };

export const REALTIME_PATH = '/ws';
