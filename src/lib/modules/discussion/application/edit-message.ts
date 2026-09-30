import type { Actor } from '$lib/modules/kernel/domain/actor';
import { excerpt, extractMentions } from '../domain/mentions';
import { findOwnMessage, type DiscussionDeps, type MessageTarget } from './deps';
import { makeOpenQuestions } from './questions';

export const makeEditMessage =
	(deps: DiscussionDeps) =>
	async (actor: Actor, { body, ...target }: MessageTarget & { body: string }) => {
		const before = await findOwnMessage(deps, actor.id, target);
		const names = await deps.members.names(target.projectId);
		const mentionIds = extractMentions(body).filter((id) => names.has(id));
		const message = await deps.messages.update(target.projectId, target.id, {
			body,
			mentionIds,
			title: excerpt(body, (id) => names.get(id))
		});
		deps.feed.upserted('message', target.projectId, message);
		if (message.isQuestion) await makeOpenQuestions(deps)(message);
		const newlyMentioned = mentionIds.filter((id) => !before.mentionIds.includes(id));
		await deps.notifier.notify({
			type: message.isQuestion ? 'question' : 'mention',
			projectId: target.projectId,
			actor,
			element: message,
			recipientIds: newlyMentioned
		});
		await deps.references.sync(target.projectId, target.id, [body]);
		return message;
	};

export const makeDeleteMessage =
	(deps: DiscussionDeps) => async (actor: Actor, target: MessageTarget) => {
		await findOwnMessage(deps, actor.id, target);
		const closed = await deps.questions.close(target.id);
		await deps.messages.delete(target.projectId, target.id);
		closed.forEach((id) => deps.feed.deleted('question', target.projectId, id));
		deps.feed.deleted('message', target.projectId, target.id);
	};
