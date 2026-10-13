import { SvelteMap } from 'svelte/reactivity';
import type { Activity, Notification, ProjectVisit } from '$lib/modules/activity/domain/activity';
import type { Channel, ChannelState, Message } from '$lib/modules/chat/domain/chat';
import type { StoredFile } from '$lib/modules/files/domain/file';
import type { Folder } from '$lib/modules/files/domain/folder';
import type { User } from '$lib/modules/identity/domain/user';
import type { AvailabilitySlot, WorkBlock } from '$lib/modules/planning/domain/availability';
import type { Member } from '$lib/modules/projects/domain/membership';
import type { Project } from '$lib/modules/projects/domain/project';
import type { Task } from '$lib/modules/tasks/domain/task';
import type { VaultEntry } from '$lib/modules/vault/domain/entry';
import type { Snapshot } from '$lib/server/snapshot';
import type { CollectionName, ServerEvent } from '$lib/shared/realtime';
import { Collection } from './collection.svelte';
import { MessageStore } from './messages.svelte';

const TYPING_MS = 5000;

const keyOf = (item: object) => ('id' in item ? String(item.id) : '');

/** Everything the screens show, for all my projects, kept live by the realtime feed. */
export class AppState {
	meId = $state('');
	online = $state<string[]>([]);
	users = new Collection<User>();
	projects = new Collection<Project>();
	members = new Collection<Member>();
	tasks = new Collection<Task>();
	channels = new Collection<Channel>();
	channelStates = new Collection<ChannelState>([], (s) => s.channelId);
	files = new Collection<StoredFile>();
	folders = new Collection<Folder>();
	vault = new Collection<VaultEntry>();
	slots = new Collection<AvailabilitySlot>();
	blocks = new Collection<WorkBlock>();
	activities = new Collection<Activity>();
	notifications = new Collection<Notification>();
	/** My last catch-up per project. */
	visits = new Collection<ProjectVisit>([], (v) => v.projectId);
	messages = new MessageStore();
	/** `channelId:userId` → when the "is typing" hint stops. */
	typing = new SvelteMap<string, number>();
	/** The channel on screen: its new messages count as read. */
	viewingChannel = $state<string | null>(null);
	onMessageWhileViewing: ((channelId: string) => void) | null = null;
	/** Joining or leaving a project changes what I may see: the snapshot is reloaded then. */
	onTeamChange: (() => void) | null = null;
	/** Items with a local edit on its way: their echoes would briefly undo the newer local state. */
	pending = new SvelteMap<string, number>();

	constructor(snapshot: Snapshot) {
		this.reset(snapshot);
	}

	get me(): User {
		return this.users.get(this.meId)!;
	}

	reset(snapshot: Snapshot) {
		this.meId = snapshot.meId;
		this.online = snapshot.online;
		this.users.reset(snapshot.users);
		this.projects.reset(snapshot.projects);
		this.members.reset(snapshot.members);
		this.tasks.reset(snapshot.tasks);
		this.channels.reset(snapshot.channels);
		this.channelStates.reset(snapshot.channelStates);
		this.files.reset(snapshot.files);
		this.folders.reset(snapshot.folders);
		this.vault.reset(snapshot.vault);
		this.slots.reset(snapshot.slots);
		this.blocks.reset(snapshot.blocks);
		this.activities.reset(snapshot.activities);
		this.notifications.reset(snapshot.notifications);
		this.visits.reset(snapshot.visits);
		this.messages.invalidate();
	}

	apply(event: ServerEvent) {
		if (event.type === 'presence') this.online = event.online;
		else if (event.type === 'typing')
			this.typing.set(`${event.channelId}:${event.userId}`, Date.now() + TYPING_MS);
		else if (event.type === 'removed') this.removed(event.collection, event.item);
		else if (this.pending.has(keyOf(event.item))) return;
		else if (event.collection === 'messages') this.messageSaved(event.item);
		else if (event.collection === 'members') this.memberSaved(event.item);
		else this.collection(event.collection)?.upsert(event.item as never);
	}

	private collection(name: CollectionName): Collection<unknown> | null {
		if (name === 'messages') return null;
		return this[name] as Collection<unknown>;
	}

	private removed(name: CollectionName, item: object) {
		if (name === 'messages') return this.messages.remove(keyOf(item));
		if (name === 'members' && (item as Member).userId === this.meId) return this.onTeamChange?.();
		this.collection(name)?.remove(keyOf(item));
	}

	private memberSaved(member: Member) {
		const known = this.users.get(member.userId);
		this.members.upsert(member);
		// A newcomer (or me, joining) brings data this snapshot does not have yet.
		if (!known || member.userId === this.meId) this.onTeamChange?.();
	}

	private messageSaved(message: Message) {
		const isNew = !message.editedAt && !this.messages.find(message.id);
		this.messages.upsert(message);
		this.typing.delete(`${message.channelId}:${message.authorId}`);
		const state = this.channelStates.get(message.channelId);
		const total = (state?.total ?? 0) + (isNew ? 1 : 0);
		const viewing =
			this.viewingChannel === message.channelId && document.visibilityState === 'visible';
		if (!isNew || message.authorId === this.meId || viewing) {
			this.channelStates.upsert({
				channelId: message.channelId,
				lastReadAt: state?.lastReadAt ?? null,
				unread: state?.unread ?? 0,
				mentions: state?.mentions ?? 0,
				total
			});
			if (isNew && viewing && message.authorId !== this.meId)
				this.onMessageWhileViewing?.(message.channelId);
			return;
		}
		this.channelStates.upsert({
			channelId: message.channelId,
			lastReadAt: state?.lastReadAt ?? null,
			unread: (state?.unread ?? 0) + 1,
			mentions: (state?.mentions ?? 0) + (message.body.includes(`<@${this.meId}>`) ? 1 : 0),
			total
		});
	}
}
