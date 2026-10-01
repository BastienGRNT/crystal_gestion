import type { ElementBase } from '$lib/modules/kernel/domain/element';

export interface Message extends ElementBase {
	kind: 'message';
	projectId: string;
	/** `null` is the project's Général channel; otherwise the feature's thread. */
	featureId: string | null;
	/** A channel under Général; `null` with `featureId` also `null` is Général itself. */
	channelId: string | null;
	authorId: string;
	body: string;
	replyToId: string | null;
	isQuestion: boolean;
	mentionIds: string[];
	createdAt: string;
	editedAt: string | null;
}

/** One open question per mentioned person; answered by a reply or marked as handled. */
export interface Question {
	id: string;
	projectId: string;
	messageId: string;
	userId: string;
	resolvedAt: string | null;
}

export const questionId = (messageId: string, userId: string) => `${messageId}:${userId}`;
export const isOpenQuestion = (question: Question) => question.resolvedAt === null;
