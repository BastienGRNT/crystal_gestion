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
