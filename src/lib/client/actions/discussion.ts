import type { Message } from '$lib/modules/discussion/domain/message';
import { send } from '../commands';
import { draftId, optimistic } from '../live/optimistic';
import type { ProjectStore } from '../project-store.svelte';
import { createOptimistically } from './create';
import { deleteWithUndo } from '../live/undoable';

export interface NewMessage {
	featureId: string | null;
	channelId: string | null;
	body: string;
	replyToId?: string | null;
	isQuestion?: boolean;
}

export function discussionActions(store: ProjectStore, meId: string) {
	const projectId = () => store.project.id;
	const target = (id: string) => ({ projectId: projectId(), id });
	const draft = (input: NewMessage): Message => ({
		id: draftId(),
		ref: 'M-…',
		kind: 'message',
		title: input.body.slice(0, 90),
		projectId: projectId(),
		authorId: meId,
		replyToId: null,
		isQuestion: false,
		mentionIds: [],
		createdAt: new Date().toISOString(),
		editedAt: null,
		...input
	});
	return {
		post: (input: NewMessage) =>
			createOptimistically(store, 'message', draft(input), () =>
				send('messages.post', { projectId: projectId(), ...input })
			),
		edit: (id: string, body: string) =>
			optimistic(
				() => store.messages.patch(id, { body }),
				() => send('messages.edit', { ...target(id), body })
			),
		remove: (id: string) =>
			deleteWithUndo(
				'Message supprimé',
				() => store.messages.remove(id),
				() => send('messages.delete', target(id))
			),
		markQuestion: (id: string, isQuestion: boolean) =>
			optimistic(
				() => store.messages.patch(id, { isQuestion }),
				() => send('messages.markQuestion', { ...target(id), isQuestion })
			),
		resolveQuestion: (messageId: string) =>
			optimistic(
				() =>
					store.questions.patch(`${messageId}:${meId}`, { resolvedAt: new Date().toISOString() }),
				() => send('questions.resolve', { projectId: projectId(), messageId })
			)
	};
}
