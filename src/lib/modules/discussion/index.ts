import { makeChannelUseCases } from './application/channels';
import type { DiscussionDeps } from './application/deps';
import { makeDeleteMessage, makeEditMessage } from './application/edit-message';
import { makePostMessage } from './application/post-message';
import { makeMarkQuestion, makeResolveQuestion } from './application/questions';
import type { ThreadKey } from './domain/channel';

const THREAD_LIMIT = 300;

export function createDiscussionModule(deps: DiscussionDeps) {
	return {
		post: makePostMessage(deps),
		edit: makeEditMessage(deps),
		remove: makeDeleteMessage(deps),
		markQuestion: makeMarkQuestion(deps),
		resolveQuestion: makeResolveQuestion(deps),
		thread: (projectId: string, thread: ThreadKey) =>
			deps.messages.listThread(projectId, thread, THREAD_LIMIT),
		about: (projectId: string, elementId: string) =>
			deps.messages.listAbout(projectId, elementId, THREAD_LIMIT),
		channels: makeChannelUseCases(deps),
		openQuestions: (projectId: string) => deps.questions.listOpen(projectId),
		findMessage: (projectId: string, id: string) => deps.messages.find(projectId, id)
	};
}

export type DiscussionModule = ReturnType<typeof createDiscussionModule>;
