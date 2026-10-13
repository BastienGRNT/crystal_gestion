/** The live contract between the server and every open screen. Isomorphic, types only. */
import type { Activity, Notification, ProjectVisit } from '$lib/modules/activity/domain/activity';
import type { Channel, Message } from '$lib/modules/chat/domain/chat';
import type { StoredFile } from '$lib/modules/files/domain/file';
import type { Folder } from '$lib/modules/files/domain/folder';
import type { User } from '$lib/modules/identity/domain/user';
import type { AvailabilitySlot, WorkBlock } from '$lib/modules/planning/domain/availability';
import type { Member } from '$lib/modules/projects/domain/membership';
import type { Project } from '$lib/modules/projects/domain/project';
import type { Task } from '$lib/modules/tasks/domain/task';
import type { VaultEntry } from '$lib/modules/vault/domain/entry';

export interface Collections {
	users: User;
	projects: Project;
	members: Member;
	tasks: Task;
	channels: Channel;
	messages: Message;
	files: StoredFile;
	folders: Folder;
	vault: VaultEntry;
	slots: AvailabilitySlot;
	blocks: WorkBlock;
	activities: Activity;
	notifications: Notification;
	visits: ProjectVisit;
}

export type CollectionName = keyof Collections;

export type SavedEvent = {
	[K in CollectionName]: { type: 'saved'; collection: K; item: Collections[K] };
}[CollectionName];

export type RemovedEvent = {
	[K in CollectionName]: { type: 'removed'; collection: K; item: Collections[K] };
}[CollectionName];

export type ServerEvent =
	| SavedEvent
	| RemovedEvent
	| { type: 'presence'; online: string[] }
	| { type: 'typing'; userId: string; channelId: string };

export type ClientEvent =
	{ type: 'ping' } | { type: 'typing'; channelId: string; projectId: string };

export const REALTIME_PATH = '/ws';
