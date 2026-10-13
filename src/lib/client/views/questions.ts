import type { Message } from '$lib/modules/chat/domain/chat';

const oldestFirst = (a: Message, b: Message) => a.createdAt.localeCompare(b.createdAt);

/** What the team waits for me to answer in a project, the longest wait first. */
export const askedOfMe = (questions: Message[], meId: string, projectId: string) =>
	questions.filter((q) => q.projectId === projectId && q.asks.includes(meId)).sort(oldestFirst);

/** My questions nobody answered yet. */
export const askedByMe = (questions: Message[], meId: string, projectId: string) =>
	questions.filter((q) => q.projectId === projectId && q.authorId === meId).sort(oldestFirst);

/** Who a task waits on: the people asked something in its thread. */
export const waitingOn = (questions: Message[], channelId: string | undefined) =>
	channelId
		? [...new Set(questions.filter((q) => q.channelId === channelId).flatMap((q) => q.asks))]
		: [];

/** A day without an answer is a wait worth showing in color. */
export const LONG_WAIT_MS = 24 * 3_600_000;
