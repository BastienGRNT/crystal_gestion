import { forbidden, invalid, notFound } from '../../kernel/domain/errors';
import type { Subject } from '../../kernel/domain/subject';
import { excerpt, mentionedIds, validBody, type Channel, type Message } from '../domain/chat';
import { memberChannel, taskThread } from './channels';
import type { ChatDeps } from './ports';

export interface PostInput {
	id: string;
	body: string;
	fileIds?: string[];
	replyToId?: string | null;
}

/** A mention in a task comment opens the task; elsewhere, the message. */
async function notifyMentions(deps: ChatDeps, message: Message, channel: Channel) {
	const mentioned = mentionedIds(message.body).filter((id) => id !== message.authorId);
	if (!mentioned.length) return;
	const names = await deps.people.names();
	const title = excerpt(message.body, names);
	const subject: Subject =
		channel.kind === 'task' && channel.taskId
			? { kind: 'task', id: channel.taskId, title, projectId: channel.projectId }
			: {
					kind: 'message',
					id: message.id,
					title,
					projectId: channel.projectId,
					channelId: channel.id
				};
	for (const userId of mentioned)
		if (await deps.access.isMember(channel.projectId, userId))
			await deps.notifier.notify({ userId, actorId: message.authorId, kind: 'mention', subject });
}

async function postIn(deps: ChatDeps, channel: Channel, input: PostInput, authorId: string) {
	const fileIds = input.fileIds ?? [];
	const now = deps.clock.now();
	if (input.replyToId) {
		const original = await deps.messages.get(input.replyToId);
		if (original?.channelId !== channel.id)
			throw invalid('On ne répond qu’à un message du même canal.');
	}
	const base = {
		id: input.id,
		channelId: channel.id,
		projectId: channel.projectId,
		authorId,
		body: validBody(input.body, fileIds.length > 0),
		replyToId: input.replyToId ?? null,
		createdAt: now.toISOString(),
		editedAt: null
	};
	await deps.messages.insert(base);
	const attachments = await deps.attachments.attach(fileIds, base.id, channel.projectId, authorId);
	const message: Message = { ...base, attachments };
	// Writing in a channel means you have read it.
	await deps.reads.markRead(authorId, channel.id, now);
	deps.messageFeed.saved(message);
	await notifyMentions(deps, message, channel);
	return message;
}

export const postMessage =
	(deps: ChatDeps) => async (input: PostInput & { channelId: string }, authorId: string) =>
		postIn(deps, await memberChannel(deps, input.channelId, authorId), input, authorId);

/** A comment on a task: its thread is created on the first one. */
export const commentTask =
	(deps: ChatDeps) => async (input: PostInput & { taskId: string }, authorId: string) =>
		postIn(deps, await taskThread(deps, input.taskId, authorId), input, authorId);

async function own(deps: ChatDeps, id: string, userId: string) {
	const message = await deps.messages.get(id);
	if (!message) throw notFound('Message');
	if (message.authorId !== userId) throw forbidden('Seul l’auteur peut modifier ce message.');
	return message;
}

export const editMessage = (deps: ChatDeps) => async (id: string, body: string, userId: string) => {
	const current = await own(deps, id, userId);
	const message = {
		...current,
		body: validBody(body, current.attachments.length > 0),
		editedAt: deps.clock.now().toISOString()
	};
	await deps.messages.save(message);
	deps.messageFeed.saved(message);
	return message;
};

export const deleteMessage = (deps: ChatDeps) => async (id: string, userId: string) => {
	const message = await own(deps, id, userId);
	await deps.messages.delete(id);
	deps.messageFeed.removed(message);
};

export const markRead = (deps: ChatDeps) => async (channelId: string, userId: string) => {
	await memberChannel(deps, channelId, userId);
	await deps.reads.markRead(userId, channelId, deps.clock.now());
};

export const listMessages =
	(deps: ChatDeps) =>
	async (channelId: string, before: string | null, limit: number, userId: string) => {
		await memberChannel(deps, channelId, userId);
		return deps.messages.page(channelId, before, Math.min(limit, 200));
	};
