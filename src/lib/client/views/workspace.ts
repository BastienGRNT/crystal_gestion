import type { Channel, ChannelState } from '$lib/modules/chat/domain/chat';
import type { Member } from '$lib/modules/projects/domain/membership';
import type { Project } from '$lib/modules/projects/domain/project';
import type { Task } from '$lib/modules/tasks/domain/task';

export const activeProjects = (projects: Project[]) =>
	projects.filter((p) => !p.archivedAt).sort((a, b) => a.createdAt.localeCompare(b.createdAt));

export const teamOf = (members: Member[], projectId: string) =>
	members.filter((m) => m.projectId === projectId);

export interface ProjectCounts {
	now: number;
	inbox: number;
	doing: number;
	review: number;
	todo: number;
	ideas: number;
	done: number;
	blocked: number;
}

export function projectCounts(tasks: Task[], projectId: string): ProjectCounts {
	const counts: ProjectCounts = {
		now: 0,
		inbox: 0,
		doing: 0,
		review: 0,
		todo: 0,
		ideas: 0,
		done: 0,
		blocked: 0
	};
	for (const task of tasks) {
		if (task.projectId !== projectId) continue;
		if (task.status === 'idea') counts.ideas++;
		else if (task.status === 'done') counts.done++;
		else {
			counts[task.status]++;
			if (task.blockedReason) counts.blocked++;
			if (task.status !== 'review' && task.quadrant === 'now') counts.now++;
			if (task.status === 'todo' && task.quadrant === null) counts.inbox++;
		}
	}
	return counts;
}

export const channelName = (channel: Channel) =>
	channel.kind === 'general' ? 'général' : channel.name;

/** The channels of a project (task threads live on their task, not here). */
export function channelsOf(channels: Channel[], projectId: string) {
	const mine = channels.filter((c) => c.projectId === projectId && c.kind !== 'task');
	return [
		...mine.filter((c) => c.kind === 'general'),
		...mine.filter((c) => c.kind === 'custom').sort((a, b) => a.name.localeCompare(b.name))
	];
}

export const generalOf = (channels: Channel[], projectId: string) =>
	channels.find((c) => c.projectId === projectId && c.kind === 'general') ?? null;

export const threadOf = (channels: Channel[], taskId: string) =>
	channels.find((c) => c.taskId === taskId) ?? null;

export function unreadIn(channels: Channel[], states: ChannelState[]) {
	const ids = new Set(channels.map((c) => c.id));
	let unread = 0;
	let mentions = 0;
	for (const s of states)
		if (ids.has(s.channelId)) {
			unread += s.unread;
			mentions += s.mentions;
		}
	return { unread, mentions };
}

const LAST_PROJECT = 'crystal-last-project';

export function rememberProject(slug: string) {
	try {
		localStorage.setItem(LAST_PROJECT, slug);
	} catch {
		// Not remembered in private mode: the project list opens instead.
	}
}

export function lastProject(): string | null {
	try {
		return localStorage.getItem(LAST_PROJECT);
	} catch {
		return null;
	}
}
