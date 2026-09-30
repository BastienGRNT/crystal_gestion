import type { Actor } from '$lib/modules/kernel/domain/actor';
import { invalid } from '$lib/modules/kernel/domain/errors';
import { excerpt, extractMentions } from '../domain/mentions';
import type { DiscussionDeps } from './deps';
import { makeOpenQuestions, makeResolveQuestion } from './questions';

export interface PostInput {
	projectId: string;
	featureId: string | null;
	body: string;
	replyToId: string | null;
	isQuestion: boolean;
}

export const makePostMessage = (deps: DiscussionDeps) => async (actor: Actor, input: PostInput) => {
	if (!input.body.trim()) throw invalid('Le message est vide');
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
