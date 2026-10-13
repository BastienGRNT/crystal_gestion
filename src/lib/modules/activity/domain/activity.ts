import type { ActivityVerb, NotificationKind, Subject } from '../../kernel/domain/subject';

export interface Activity {
	id: string;
	projectId: string;
	actorId: string;
	verb: ActivityVerb;
	subject: Subject;
	createdAt: string;
}

/** Something addressed to one person: a task given to them, a message that mentions them. */
export interface Notification {
	id: string;
	userId: string;
	projectId: string;
	actorId: string;
	kind: NotificationKind;
	subject: Subject;
	createdAt: string;
	readAt: string | null;
}

/** When someone last caught up on a project: "new since" starts there. */
export interface ProjectVisit {
	projectId: string;
	userId: string;
	seenAt: string;
}

const CATCH_UP_DAYS = 7;

/**
 * Where "since your last visit" starts: the last catch-up, else the day one joined, and never
 * more than a week back (older news is history, not news).
 */
export function catchUpSince(seenAt: string | null, joinedAt: string | null, now: Date): string {
	const floor = new Date(now.getTime() - CATCH_UP_DAYS * 86_400_000).toISOString();
	const start = seenAt ?? joinedAt ?? floor;
	return start > floor ? start : floor;
}
