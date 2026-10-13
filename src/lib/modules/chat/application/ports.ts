import type {
	Access,
	ActivityLog,
	ChangeFeed,
	Clock,
	Notifier
} from '../../kernel/application/ports';
import type { Attachment, Channel, ChannelState, Message } from '../domain/chat';

export interface ChannelRepository {
	ofProjects(projectIds: string[]): Promise<Channel[]>;
	get(id: string): Promise<Channel | null>;
	generalOf(projectId: string): Promise<Channel | null>;
	ofTask(taskId: string): Promise<Channel | null>;
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
	/** Questions nobody answered yet, oldest first: of some projects, or of one channel. */
	openQuestions(scope: { projectIds: string[] } | { channelId: string }): Promise<Message[]>;
}

export interface ReadRepository {
	markRead(userId: string, channelId: string, at: Date): Promise<void>;
	states(userId: string, projectIds: string[]): Promise<ChannelState[]>;
}

/** Files are their own module: chat only asks to file uploaded ones with the message. */
export interface AttachmentLinker {
	attach(
		fileIds: string[],
		messageId: string,
		projectId: string,
		actorId: string
	): Promise<Attachment[]>;
}

export interface PeopleNames {
	names(): Promise<Map<string, string>>;
}

/** What chat needs to know about a task to host its comments. */
export interface TaskLookup {
	get(taskId: string, actorId: string): Promise<{ id: string; projectId: string; title: string }>;
}

export interface ChatDeps {
	channels: ChannelRepository;
	messages: MessageRepository;
	reads: ReadRepository;
	attachments: AttachmentLinker;
	people: PeopleNames;
	tasks: TaskLookup;
	access: Access;
	clock: Clock;
	channelFeed: ChangeFeed<Channel>;
	messageFeed: ChangeFeed<Message>;
	activity: ActivityLog;
	notifier: Notifier;
}
