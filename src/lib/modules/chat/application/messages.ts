import { forbidden, invalid, notFound } from '../../kernel/domain/errors';
import type { Subject } from '../../kernel/domain/subject';
import {
	answers,
	askedIn,
	excerpt,
	isOpenQuestion,
	mentionedIds,
	validBody,
	type Channel,
	type Message
} from '../domain/chat';
import { memberChannel, taskThread } from './channels';
import type { ChatDeps } from './ports';

export interface PostInput {
	id: string;
	body: string;
	fileIds?: string[];
	replyToId?: string | null;
}

/** A mention in a task comment opens the task; elsewhere, the message. */
const subjectOf = (message: Message, channel: Channel, title: string): Subject =>
	channel.kind === 'task' && channel.taskId
		? {
				kind: 'task',
				id: channel.taskId,
				title,
				projectId: channel.projectId,
				channelId: channel.id
			}
		: {
				kind: 'message',
				id: message.id,
				title,
				projectId: channel.projectId,
				channelId: channel.id
			};

async function notifyMentions(deps: ChatDeps, message: Message, channel: Channel) {
	const mentioned = mentionedIds(message.body).filter((id) => id !== message.authorId);
	if (!mentioned.length) return;
	const subject = subjectOf(message, channel, excerpt(message.body, await deps.people.names()));
	for (const userId of mentioned)
		if (await deps.access.isMember(channel.projectId, userId))
			await deps.notifier.notify({ userId, actorId: message.authorId, kind: 'mention', subject });
}

/** Only teammates can be asked: mentioning someone outside the project asks nothing. */
async function askable(deps: ChatDeps, body: string, authorId: string, projectId: string) {
	const asked: string[] = [];
	for (const id of askedIn(body, authorId))
		if (await deps.access.isMember(projectId, id)) asked.push(id);
	return asked;
}

/** The questions a message answers are closed, and whoever asked hears about it. */
async function closeAnswered(
	deps: ChatDeps,
	message: Message,
	channel: Channel,
	original: Message | null
) {
	const inThread = channel.kind === 'task';
	const candidates = inThread
		? await deps.messages.openQuestions({ channelId: channel.id })
		: original
			? [original]
			: [];
	const answered = candidates.filter((question) => answers(message, question, inThread));
	if (!answered.length) return;
	const subject = subjectOf(message, channel, excerpt(message.body, await deps.people.names()));
	const mentioned = mentionedIds(message.body);
	for (const question of answered) {
		const closed = { ...question, answeredAt: message.createdAt };
		await deps.messages.save(closed);
		deps.messageFeed.saved(closed);
		// Mentioned in the answer: that notification already tells them.
		if (!mentioned.includes(question.authorId))
			await deps.notifier.notify({
				userId: question.authorId,
				actorId: message.authorId,
				kind: 'answer',
				subject
			});
	}
}

async function postIn(deps: ChatDeps, channel: Channel, input: PostInput, authorId: string) {
	const fileIds = input.fileIds ?? [];
	const now = deps.clock.now();
	const original = input.replyToId ? await deps.messages.get(input.replyToId) : null;
	if (input.replyToId && original?.channelId !== channel.id)
		throw invalid('On ne répond qu’à un message du même canal.');
	const body = validBody(input.body, fileIds.length > 0);
	const base = {
		id: input.id,
		channelId: channel.id,
		projectId: channel.projectId,
		authorId,
		body,
		replyToId: input.replyToId ?? null,
		createdAt: now.toISOString(),
		editedAt: null,
		asks: await askable(deps, body, authorId, channel.projectId),
		answeredAt: null
	};
	await deps.messages.insert(base);
	const attachments = await deps.attachments.attach(fileIds, base.id, channel.projectId, authorId);
	const message: Message = { ...base, attachments };
	// Writing in a channel means you have read it.
	await deps.reads.markRead(authorId, channel.id, now);
	deps.messageFeed.saved(message);
	await notifyMentions(deps, message, channel);
	await closeAnswered(deps, message, channel, original);
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
	const text = validBody(body, current.attachments.length > 0);
	const message = {
		...current,
		body: text,
		editedAt: deps.clock.now().toISOString(),
		// Rewording a question can change who it asks, as long as nobody answered it.
		asks: current.answeredAt ? current.asks : await askable(deps, text, userId, current.projectId)
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

/** "Déjà répondu" or "plus d'actualité": the one who asked, or someone asked, closes it. */
export const resolveQuestion = (deps: ChatDeps) => async (id: string, userId: string) => {
	const question = await deps.messages.get(id);
	if (!question) throw notFound('Message');
	await deps.access.assertMember(question.projectId, userId);
	if (question.authorId !== userId && !question.asks.includes(userId))
		throw forbidden('Seules les personnes concernées peuvent clore cette question.');
	if (!isOpenQuestion(question)) return question;
	const closed = { ...question, answeredAt: deps.clock.now().toISOString() };
	await deps.messages.save(closed);
	deps.messageFeed.saved(closed);
	return closed;
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
