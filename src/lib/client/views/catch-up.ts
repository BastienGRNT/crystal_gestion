import type { Activity, Notification } from '$lib/modules/activity/domain/activity';
import type { Channel, ChannelState, Message } from '$lib/modules/chat/domain/chat';
import type { Subject } from '$lib/modules/kernel/domain/subject';

/** What one teammate moved since my last visit: each task once, in its latest state. */
export interface Progress {
	actorId: string;
	done: Subject[];
	review: Subject[];
	started: Subject[];
	blocked: Subject[];
	created: number;
	files: number;
	vault: number;
	channels: Subject[];
	joined: boolean;
}

const TASK_LISTS = {
	'task.done': 'done',
	'task.review': 'review',
	'task.started': 'started',
	'task.blocked': 'blocked'
} as const;

export function teamProgress(activities: Activity[], since: string, meId: string): Progress[] {
	const people = new Map<string, Progress>();
	const counted = new Set<string>();
	const news = activities
		.filter((a) => a.actorId !== meId && a.createdAt > since)
		.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
	for (const activity of news) {
		const progress = people.get(activity.actorId) ?? emptyProgress(activity.actorId);
		people.set(activity.actorId, progress);
		const verb = activity.verb;
		if (verb in TASK_LISTS) {
			const key = `${activity.actorId}:${activity.subject.id}`;
			if (!counted.has(key))
				progress[TASK_LISTS[verb as keyof typeof TASK_LISTS]].push(activity.subject);
			counted.add(key);
		} else if (verb === 'task.created') progress.created++;
		else if (verb === 'file.uploaded') progress.files++;
		else if (verb === 'vault.added') progress.vault++;
		else if (verb === 'channel.created') progress.channels.push(activity.subject);
		else if (verb === 'member.joined') progress.joined = true;
	}
	return [...people.values()];
}

const emptyProgress = (actorId: string): Progress => ({
	actorId,
	done: [],
	review: [],
	started: [],
	blocked: [],
	created: 0,
	files: 0,
	vault: 0,
	channels: [],
	joined: false
});

/** Channels and task threads of a project with messages I have not read, mentions first. */
export function missedChannels(
	channels: Channel[],
	stateOf: (channelId: string) => ChannelState | undefined,
	projectId: string
) {
	return channels
		.filter((c) => c.projectId === projectId && (stateOf(c.id)?.unread ?? 0) > 0)
		.map((channel) => ({ channel, state: stateOf(channel.id)! }))
		.sort((a, b) => b.state.mentions - a.state.mentions || b.state.unread - a.state.unread);
}

/** The latest messages I have not read in a channel, oldest first. */
export const unreadMessages = (
	messages: Message[],
	lastReadAt: string | null,
	meId: string,
	max = 3
) =>
	messages
		.filter((m) => m.authorId !== meId && (!lastReadAt || m.createdAt > lastReadAt))
		.slice(-max);

/** Mentions are already visible in their channel's missed messages: no need to say it twice. */
export const pendingNotifications = (
	notifications: Notification[],
	projectId: string,
	missedChannelIds: Set<string>
) =>
	notifications
		.filter(
			(n) =>
				n.projectId === projectId &&
				!n.readAt &&
				!(n.kind === 'mention' && n.subject.channelId && missedChannelIds.has(n.subject.channelId))
		)
		.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
