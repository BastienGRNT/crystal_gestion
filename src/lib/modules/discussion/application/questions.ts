import type { Actor } from '$lib/modules/kernel/domain/actor';
import type { Message } from '../domain/message';
import { findOwnMessage, type DiscussionDeps, type MessageTarget } from './deps';

export const makeOpenQuestions = (deps: DiscussionDeps) => async (message: Message) => {
	const opened = await deps.questions.open(message.projectId, message.id, message.mentionIds);
	opened.forEach((question) => deps.feed.upserted('question', message.projectId, question));
};

/** Answering (replying) or dismissing both close the question for that person only. */
export const makeResolveQuestion =
	(deps: DiscussionDeps) =>
	async (actor: Actor, { projectId, messageId }: { projectId: string; messageId: string }) => {
		const question = await deps.questions.resolve(messageId, actor.id, deps.clock.now());
		if (question) deps.feed.upserted('question', projectId, question);
	};

export const makeMarkQuestion =
	(deps: DiscussionDeps) =>
	async (actor: Actor, { isQuestion, ...target }: MessageTarget & { isQuestion: boolean }) => {
		const message = await findOwnMessage(deps, actor.id, target);
		const updated = await deps.messages.update(target.projectId, target.id, { isQuestion });
		deps.feed.upserted('message', target.projectId, updated);
		if (isQuestion) {
			await makeOpenQuestions(deps)(updated);
			await deps.notifier.notify({
				type: 'question',
				projectId: target.projectId,
				actor,
				element: updated,
				recipientIds: message.mentionIds
			});
		} else {
			const closed = await deps.questions.close(target.id);
			closed.forEach((id) => deps.feed.deleted('question', target.projectId, id));
		}
		return updated;
	};
