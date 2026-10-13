import { forbidden, notFound } from '../../kernel/domain/errors';
import { excerpt, mentionedIds, validBody, type Channel, type Message } from '../domain/chat';
import type { ChatDeps } from './ports';

export interface PostInput {
	id: string;
	channelId: string;
	body: string;
	fileIds?: string[];
}

async function notifyMentions(deps: ChatDeps, message: Message, channel: Channel) {
	const mentioned = mentionedIds(message.body).filter((id) => id !== message.authorId);
	if (!mentioned.length) return;
	const names = await deps.people.names();
	for (const userId of mentioned)
		await deps.notifier.notify({
			userId,
			actorId: message.authorId,
			kind: 'mention',
			subject: {
				kind: 'message',
				id: message.id,
				title: excerpt(message.body, names),
				projectId: channel.projectId,
				channelId: channel.id
			}
		});
}

export const postMessage = (deps: ChatDeps) => async (input: PostInput, authorId: string) => {
	const channel = await deps.channels.get(input.channelId);
	if (!channel) throw notFound('Canal');
	const fileIds = input.fileIds ?? [];
	const now = deps.clock.now();
	const base = {
		id: input.id,
		channelId: channel.id,
		authorId,
		body: validBody(input.body, fileIds.length > 0),
		createdAt: now.toISOString(),
		editedAt: null
	};
	await deps.messages.insert(base);
	const attachments = await deps.attachments.attach(fileIds, base.id, channel.projectId);
	const message: Message = { ...base, attachments };
	// Writing in a channel means you have read it.
	await deps.reads.markRead(authorId, channel.id, now);
	deps.messageFeed.saved(message);
	await notifyMentions(deps, message, channel);
	return message;
};

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
	await own(deps, id, userId);
	await deps.messages.delete(id);
	deps.messageFeed.removed(id);
};

export const markRead = (deps: ChatDeps) => (channelId: string, userId: string) =>
	deps.reads.markRead(userId, channelId, deps.clock.now());
