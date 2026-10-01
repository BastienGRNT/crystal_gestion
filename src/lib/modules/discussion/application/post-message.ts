import type { Actor } from '$lib/modules/kernel/domain/actor';
import { invalid } from '$lib/modules/kernel/domain/errors';
import { excerpt, extractMentions } from '../domain/mentions';
import type { DiscussionDeps } from './deps';
import { makeOpenQuestions, makeResolveQuestion } from './questions';

export interface PostInput {
	projectId: string;
	featureId: string | null;
	channelId: string | null;
	body: string;
	replyToId: string | null;
	isQuestion: boolean;
}

/** A reply lives in the thread of the message it answers, wherever it was written from. */
async function inReplyThread(deps: DiscussionDeps, input: PostInput): Promise<PostInput> {
	const original = input.replyToId && (await deps.messages.find(input.projectId, input.replyToId));
	return original
		? { ...input, featureId: original.featureId, channelId: original.channelId }
		: input;
}

export const makePostMessage =
	(deps: DiscussionDeps) => async (actor: Actor, posted: PostInput) => {
		if (!posted.body.trim()) throw invalid('Le message est vide');
		const input = await inReplyThread(deps, posted);
		if (
			input.channelId &&
			(input.featureId || !(await deps.channels.find(input.projectId, input.channelId)))
		)
			throw invalid('Canal inconnu');
		const names = await deps.members.names(input.projectId);
		const mentionIds = extractMentions(input.body).filter((id) => names.has(id));
		const title = excerpt(input.body, (id) => names.get(id));
		const isQuestion = input.isQuestion && mentionIds.length > 0;
		const message = await deps.messages.create({
			...input,
			isQuestion,
			authorId: actor.id,
			title,
			mentionIds
		});
		deps.feed.upserted('message', message.projectId, message);
		if (isQuestion) await makeOpenQuestions(deps)(message);
		if (input.replyToId)
			await makeResolveQuestion(deps)(actor, {
				projectId: input.projectId,
				messageId: input.replyToId
			});
		await deps.notifier.notify({
			type: isQuestion ? 'question' : 'mention',
			projectId: message.projectId,
			actor,
			element: message,
			recipientIds: mentionIds
		});
		await deps.references.sync(message.projectId, message.id, [message.body]);
		await deps.activity.record({
			projectId: message.projectId,
			actor,
			verb: 'posted',
			element: message
		});
		return message;
	};
