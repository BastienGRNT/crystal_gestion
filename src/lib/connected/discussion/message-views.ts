import { formatDay, formatTime } from '$lib/client/format';
import { isDraft } from '$lib/client/live/optimistic';
import { isOpenQuestion, type Message } from '$lib/modules/discussion/domain/message';
import type { MessageView } from '$lib/ui/discussion';
import { dayLabel, sameDay } from './day-label';
import type { ViewContext } from './view-context';

const GROUP_WINDOW_MS = 5 * 60_000;

const continues = (message: Message, previous: Message | undefined) =>
	!!previous &&
	previous.authorId === message.authorId &&
	!message.replyToId &&
	!message.isQuestion &&
	Date.parse(message.createdAt) - Date.parse(previous.createdAt) < GROUP_WINDOW_MS;

function replyOf(message: Message, ctx: ViewContext): MessageView['replyTo'] {
	const quoted = message.replyToId ? ctx.element(message.replyToId) : undefined;
	if (!quoted) return null;
	const author = quoted.createdBy ? ctx.member(quoted.createdBy)?.name : undefined;
	return { ref: quoted.ref, author: author ?? 'Quelqu’un', excerpt: quoted.title };
}

export function toMessageView(message: Message, previous: Message | undefined, ctx: ViewContext) {
	const author = ctx.member(message.authorId);
	const open = ctx.questions.filter((q) => q.messageId === message.id && isOpenQuestion(q));
	const newDay = !previous || !sameDay(previous.createdAt, message.createdAt);
	return {
		id: message.id,
		ref: message.ref,
		body: message.body,
		authorName: author?.name ?? 'Ancien membre',
		authorColor: author?.color ?? 'var(--wont)',
		time: formatTime(message.createdAt),
		timestamp: `${formatDay(message.createdAt)} à ${formatTime(message.createdAt)}`,
		edited: message.editedAt !== null,
		pending: isDraft(message.id),
		mine: message.authorId === ctx.meId,
		hasMentions: message.mentionIds.length > 0,
		isQuestion: message.isQuestion,
		waitingOn: open
			.filter((q) => q.userId !== ctx.meId)
			.map((q) => ctx.member(q.userId)?.name ?? '?'),
		askedToMe: open.some((q) => q.userId === ctx.meId),
		replyTo: replyOf(message, ctx),
		links: ctx.links(message.id),
		compact: !newDay && continues(message, previous),
		day: newDay ? dayLabel(message.createdAt, ctx.today) : null
	} satisfies MessageView;
}
