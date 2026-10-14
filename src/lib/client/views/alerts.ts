import type { Activity, Notification } from '$lib/modules/activity/domain/activity';
import { excerpt, mentionedIds, type Channel, type Message } from '$lib/modules/chat/domain/chat';
import type { User } from '$lib/modules/identity/domain/user';
import type { Project } from '$lib/modules/projects/domain/project';
import type { Task } from '$lib/modules/tasks/domain/task';
import type { ServerEvent } from '$lib/shared/realtime';
import { firstName } from '../format';
import { activityVerb, notificationVerb, subjectHref } from './activity-text';

/** `mine`: what is addressed to me. `all`: also the team's messages and progress. */
export type AlertLevel = 'off' | 'mine' | 'all';

export interface DesktopAlert {
	title: string;
	body: string;
	href: string;
	/** The subject's id: a mention and its message, or a task and its assignment, replace each other. */
	tag: string;
}

interface Lookup<T> {
	get(id: string): T | undefined;
}

/** What the store knows before the event is applied (so "new" can be told from "edited"). */
export interface AlertSource {
	meId: string;
	users: Lookup<User>;
	projects: Lookup<Project>;
	channels: Lookup<Channel>;
	tasks: Lookup<Task>;
	notifications: Lookup<Notification>;
	activities: Lookup<Activity>;
	knowsMessage(id: string): boolean;
}

/** The desktop notification a live event deserves, if any. */
export function alertFor(
	event: ServerEvent,
	source: AlertSource,
	level: AlertLevel
): DesktopAlert | null {
	if (level === 'off' || event.type !== 'saved') return null;
	if (event.collection === 'notifications') return notificationAlert(event.item, source);
	if (level !== 'all') return null;
	if (event.collection === 'messages') return messageAlert(event.item, source);
	if (event.collection === 'activities') return activityAlert(event.item, source);
	return null;
}

const nameOf = (source: AlertSource, id: string) =>
	firstName(source.users.get(id)?.name ?? 'Quelqu’un');

function notificationAlert(notification: Notification, source: AlertSource) {
	if (notification.userId !== source.meId || notification.readAt) return null;
	if (source.notifications.get(notification.id)) return null;
	const project = source.projects.get(notification.projectId);
	return {
		title: `${nameOf(source, notification.actorId)} ${notificationVerb(notification)}`,
		body: withProject(notification.subject.title, project),
		href: subjectHref(notification.subject, project?.slug),
		tag: notification.subject.id
	};
}

function messageAlert(message: Message, source: AlertSource) {
	const isNew = !message.editedAt && !message.answeredAt && !source.knowsMessage(message.id);
	if (!isNew || message.authorId === source.meId) return null;
	const mentioned = mentionedIds(message.body);
	// A mention already comes as a notification of its own.
	if (mentioned.includes(source.meId)) return null;
	const channel = source.channels.get(message.channelId);
	const project = source.projects.get(message.projectId);
	if (!channel || !project) return null;
	const names = new Map(mentioned.map((id) => [id, nameOf(source, id)]));
	const task = channel.taskId ? source.tasks.get(channel.taskId) : undefined;
	const where = task ? `sur « ${task.title} »` : `dans #${channel.name}`;
	return {
		title: `${nameOf(source, message.authorId)} ${where}`,
		body: withProject(excerpt(message.body, names), project),
		href: task
			? subjectHref(
					{ kind: 'task', id: task.id, title: task.title, projectId: project.id },
					project.slug
				)
			: `/p/${project.slug}/discussion/${channel.id}`,
		tag: message.id
	};
}

function activityAlert(activity: Activity, source: AlertSource) {
	if (activity.actorId === source.meId || source.activities.get(activity.id)) return null;
	const project = source.projects.get(activity.projectId);
	if (!project) return null;
	return {
		title: project.name,
		body: `${nameOf(source, activity.actorId)} ${activityVerb(activity)} ${activity.subject.title}`,
		href: subjectHref(activity.subject, project.slug),
		tag: activity.subject.id
	};
}

const withProject = (text: string, project: Project | undefined) =>
	project ? `${text} · ${project.name}` : text;
