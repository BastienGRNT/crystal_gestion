import type {
	ActivityLog,
	ChangeFeed,
	Clock,
	Notifier,
	ReferenceSync
} from '$lib/modules/kernel/application/ports';
import { forbidden, notFound } from '$lib/modules/kernel/domain/errors';
import type {
	ChannelRepository,
	MemberNames,
	MessageRepository,
	QuestionRepository
} from './ports';

export interface DiscussionDeps {
	messages: MessageRepository;
	channels: ChannelRepository;
	questions: QuestionRepository;
	members: MemberNames;
	feed: ChangeFeed;
	activity: ActivityLog;
	notifier: Notifier;
	references: ReferenceSync;
	clock: Clock;
}

export type MessageTarget = { projectId: string; id: string };

/** Only the author may edit, delete or requalify a message. */
export async function findOwnMessage(
	deps: DiscussionDeps,
	authorId: string,
	{ projectId, id }: MessageTarget
) {
	const message = await deps.messages.find(projectId, id);
	if (!message) throw notFound('Message');
	if (message.authorId !== authorId) throw forbidden('Seul l’auteur peut modifier ce message');
	return message;
}
