import {
	createProjectChannel,
	createTopic,
	deleteTopic,
	ensureGeneral,
	renameTopic
} from './application/channels';
import { deleteMessage, editMessage, markRead, postMessage } from './application/messages';
import type { ChatDeps } from './application/ports';

export function createChat(deps: ChatDeps) {
	return {
		channels: () => deps.channels.list(),
		states: (userId: string) => deps.reads.states(userId),
		messages: (channelId: string, before: string | null, limit = 60) =>
			deps.messages.page(channelId, before, Math.min(limit, 200)),
		ensureGeneral: ensureGeneral(deps),
		createProjectChannel: createProjectChannel(deps),
		createTopic: createTopic(deps),
		renameTopic: renameTopic(deps),
		deleteTopic: deleteTopic(deps),
		post: postMessage(deps),
		edit: editMessage(deps),
		delete: deleteMessage(deps),
		markRead: markRead(deps)
	};
}

export type Chat = ReturnType<typeof createChat>;
