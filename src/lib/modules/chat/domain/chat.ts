import { ensure, requiredText } from '../../kernel/domain/errors';

/**
 * Every project has its `general` channel, as many `custom` ones as the team wants, and a
 * hidden `task` thread per task that gets comments.
 */
export type ChannelKind = 'general' | 'custom' | 'task';

export interface Channel {
	id: string;
	projectId: string;
	kind: ChannelKind;
	name: string;
	/** Set for the comment thread of a task. */
	taskId: string | null;
	createdBy: string | null;
	createdAt: string;
}

export interface Attachment {
	id: string;
	name: string;
	mime: string;
	size: number;
}

export interface Message {
	id: string;
	channelId: string;
	projectId: string;
	authorId: string;
	/** Mentions are stored as `<@userId>` so renaming someone never breaks them. */
	body: string;
	replyToId: string | null;
	createdAt: string;
	editedAt: string | null;
	attachments: Attachment[];
	/**
	 * Who this message asks something (mentioned, with a "?"): the question stays in front of
	 * them until one answers. Empty for any other message.
	 */
	asks: string[];
	answeredAt: string | null;
}

/** Where someone stands in a channel. */
export interface ChannelState {
	channelId: string;
	lastReadAt: string | null;
	unread: number;
	mentions: number;
	/** All messages, read or not (comment counts on cards). */
	total: number;
}

export const MESSAGE_MAX = 8000;

export function validChannelName(name: string): string {
	const clean = requiredText(name.trim().replace(/^#+/, ''), 'Le nom du canal', 40);
	return clean.toLowerCase().replace(/\s+/g, '-');
}

export function validBody(body: string, hasAttachments: boolean): string {
	const text = body.trim();
	ensure(text.length > 0 || hasAttachments, 'Le message est vide.');
	ensure(
		text.length <= MESSAGE_MAX,
		`Le message est trop long (${MESSAGE_MAX} caractères maximum).`
	);
	return text;
}

const MENTION = /<@([0-9a-f-]{36})>/g;

export const mentionedIds = (body: string) => [
	...new Set([...body.matchAll(MENTION)].map((m) => m[1]))
];

/** Code, links and quotes can hold a "?" that asks nothing. */
const prose = (body: string) =>
	body
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/`[^`]*`/g, ' ')
		.replace(/https?:\/\/\S+/g, ' ')
		.replace(/^>.*$/gm, ' ');

/** "@Ana on part sur Stripe ?" asks Ana. Nobody has to tick a "question" box. */
export function askedIn(body: string, authorId: string): string[] {
	if (!prose(body).includes('?')) return [];
	return mentionedIds(body).filter((id) => id !== authorId);
}

export const isOpenQuestion = (message: Message) => message.asks.length > 0 && !message.answeredAt;

/**
 * Someone asked answers by replying to the question; in a task thread, where there is no
 * reply button, any comment of theirs counts.
 */
export function answers(
	reply: Pick<Message, 'authorId' | 'replyToId' | 'channelId'>,
	question: Message,
	inTaskThread: boolean
): boolean {
	return (
		isOpenQuestion(question) &&
		question.channelId === reply.channelId &&
		question.asks.includes(reply.authorId) &&
		(inTaskThread || reply.replyToId === question.id)
	);
}

/** A one-line preview for notifications ("@Ana" stays readable, code fences are dropped). */
export function excerpt(body: string, names: Map<string, string>, max = 90): string {
	const flat = body
		.replace(MENTION, (_, id: string) => `@${names.get(id) ?? 'quelqu’un'}`)
		.replace(/```[\s\S]*?```/g, '[code]')
		.replace(/\s+/g, ' ')
		.trim();
	return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat || 'Fichier joint';
}
