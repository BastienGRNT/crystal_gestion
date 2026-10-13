import { createChannel, deleteChannel, ensureGeneral, renameChannel } from './application/channels';
import {
	commentTask,
	deleteMessage,
	editMessage,
	listMessages,
	markRead,
	postMessage,
	resolveQuestion
} from './application/messages';
import type { ChatDeps } from './application/ports';

export function createChat(deps: ChatDeps) {
	return {
		channels: (projectIds: string[]) => deps.channels.ofProjects(projectIds),
		states: (userId: string, projectIds: string[]) => deps.reads.states(userId, projectIds),
		messages: listMessages(deps),
		ensureGeneral: ensureGeneral(deps),
		createChannel: createChannel(deps),
		renameChannel: renameChannel(deps),
		deleteChannel: deleteChannel(deps),
		post: postMessage(deps),
		comment: commentTask(deps),
		edit: editMessage(deps),
		delete: deleteMessage(deps),
		markRead: markRead(deps),
		resolveQuestion: resolveQuestion(deps),
		openQuestions: (projectIds: string[]) =>
			projectIds.length ? deps.messages.openQuestions({ projectIds }) : Promise.resolve([])
	};
}

export type Chat = ReturnType<typeof createChat>;
