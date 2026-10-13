/** What an activity line or a notification points at, with enough to display and open it. */
export type SubjectKind = 'task' | 'file' | 'vault' | 'project' | 'channel' | 'message';

export interface Subject {
	kind: SubjectKind;
	id: string;
	title: string;
	projectId: string | null;
	channelId?: string;
}

export type ActivityVerb =
	| 'project.created'
	| 'task.created'
	| 'task.started'
	| 'task.done'
	| 'file.uploaded'
	| 'vault.added'
	| 'channel.created';

export type NotificationKind = 'assigned' | 'mention';

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
