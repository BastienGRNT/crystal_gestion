import type { Message } from '$lib/modules/chat/domain/chat';
import { toDateKey, type DateKey } from '$lib/modules/kernel/domain/dates';
import { capitalize, dayLabel } from '../format';

export interface MessageView {
	message: Message;
	/** First of a run by the same person: show their name and avatar. */
	showAuthor: boolean;
	dayBreak: string | null;
	/** The first message you have not read yet. */
	unreadBreak: boolean;
}

const GROUP_MS = 5 * 60_000;

export function messageViews(
	messages: Message[],
	{ lastReadAt, meId, today }: { lastReadAt: string | null; meId: string; today: DateKey }
): MessageView[] {
	let unreadShown = false;
	return messages.map((message, i) => {
		const previous = messages[i - 1];
		const day = toDateKey(new Date(message.createdAt));
		const newDay = !previous || toDateKey(new Date(previous.createdAt)) !== day;
		const unread =
			!unreadShown &&
			lastReadAt !== null &&
			message.authorId !== meId &&
			message.createdAt > lastReadAt;
		if (unread) unreadShown = true;
		const gap = previous
			? Date.parse(message.createdAt) - Date.parse(previous.createdAt)
			: Infinity;
		return {
			message,
			showAuthor: newDay || unread || previous?.authorId !== message.authorId || gap > GROUP_MS,
			dayBreak: newDay ? capitalize(dayLabel(day, today)) : null,
			unreadBreak: unread
		};
	});
}
