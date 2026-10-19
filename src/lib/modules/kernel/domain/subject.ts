/** What an activity line or a notification points at, with enough to display and open it. */
export type SubjectKind =
	| 'task'
	| 'file'
	| 'vault'
	| 'project'
	| 'channel'
	| 'message'
	| 'milestone'
	| 'decision'
	| 'release';

export interface Subject {
	kind: SubjectKind;
	id: string;
	title: string;
	projectId: string;
	channelId?: string;
}

export type ActivityVerb =
	| 'project.created'
	| 'member.joined'
	| 'task.created'
	| 'task.started'
	| 'task.review'
	| 'task.done'
	| 'task.blocked'
	| 'file.uploaded'
	| 'vault.added'
	| 'channel.created'
	| 'milestone.closed'
	| 'decision.made'
	| 'bug.critical'
	| 'release.shipped';

/**
 * `review`: someone asks you to check their work. `answer`: someone answered your question.
 * `urgent`: a bug blocks production or a client.
 */
export type NotificationKind = 'assigned' | 'mention' | 'review' | 'answer' | 'urgent';

export interface ActivityInput {
	actorId: string;
	verb: ActivityVerb;
	subject: Subject;
}

export interface NotificationInput {
	userId: string;
	actorId: string;
	kind: NotificationKind;
	subject: Subject;
}
