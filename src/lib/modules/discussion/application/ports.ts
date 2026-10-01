import type { Channel, ThreadKey } from '../domain/channel';
import type { Message, Question } from '../domain/message';

export interface NewMessage {
	projectId: string;
	featureId: string | null;
	channelId: string | null;
	authorId: string;
	body: string;
	title: string;
	replyToId: string | null;
	isQuestion: boolean;
	mentionIds: string[];
}

export type MessageChanges = Partial<Pick<Message, 'body' | 'title' | 'mentionIds' | 'isQuestion'>>;

export interface MessageRepository {
	create(message: NewMessage): Promise<Message>;
	update(projectId: string, id: string, changes: MessageChanges): Promise<Message>;
	find(projectId: string, id: string): Promise<Message | null>;
	delete(projectId: string, id: string): Promise<void>;
	listThread(projectId: string, thread: ThreadKey, limit: number): Promise<Message[]>;
	/** Messages citing an element (`#T-12`), whatever their thread: the talk about it. */
	listAbout(projectId: string, elementId: string, limit: number): Promise<Message[]>;
}

export interface QuestionRepository {
	open(projectId: string, messageId: string, userIds: string[]): Promise<Question[]>;
	close(messageId: string): Promise<string[]>;
	resolve(messageId: string, userId: string, at: Date): Promise<Question | null>;
	listOpen(projectId: string): Promise<Question[]>;
}

export interface MemberNames {
	names(projectId: string): Promise<Map<string, string>>;
}

export interface ChannelRepository {
	create(channel: { projectId: string; name: string }): Promise<Channel>;
	rename(projectId: string, id: string, name: string): Promise<Channel | null>;
	/** Deletes the channel and its messages. */
	delete(projectId: string, id: string): Promise<boolean>;
	find(projectId: string, id: string): Promise<Channel | null>;
	list(projectId: string): Promise<Channel[]>;
}
