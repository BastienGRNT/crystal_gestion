import type { ActivityLog, ChangeFeed, Clock, Notifier } from '../../kernel/application/ports';
import type { Attachment, Channel, ChannelState, Message } from '../domain/chat';

export interface ChannelRepository {
	list(): Promise<Channel[]>;
	get(id: string): Promise<Channel | null>;
	findGeneral(): Promise<Channel | null>;
	insert(channel: Channel): Promise<void>;
	save(channel: Channel): Promise<void>;
	delete(id: string): Promise<void>;
}

export interface MessageRepository {
	get(id: string): Promise<Message | null>;
	insert(message: Omit<Message, 'attachments'>): Promise<void>;
	save(message: Message): Promise<void>;
	delete(id: string): Promise<void>;
	/** Messages before `before` (or the latest), oldest first. */
	page(channelId: string, before: string | null, limit: number): Promise<Message[]>;
}

export interface ReadRepository {
	markRead(userId: string, channelId: string, at: Date): Promise<void>;
	states(userId: string): Promise<ChannelState[]>;
}

/** Files are their own module: chat only asks to link uploaded ones to a message. */
export interface AttachmentLinker {
	attach(fileIds: string[], messageId: string, projectId: string | null): Promise<Attachment[]>;
}

export interface PeopleNames {
	names(): Promise<Map<string, string>>;
}

export interface ChatDeps {
	channels: ChannelRepository;
	messages: MessageRepository;
	reads: ReadRepository;
	attachments: AttachmentLinker;
	people: PeopleNames;
	clock: Clock;
	channelFeed: ChangeFeed<Channel>;
	messageFeed: ChangeFeed<Message>;
	activity: ActivityLog;
	notifier: Notifier;
}
