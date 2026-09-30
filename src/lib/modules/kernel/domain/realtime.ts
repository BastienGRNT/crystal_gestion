export type EntityName =
	| 'project'
	| 'member'
	| 'feature'
	| 'task'
	| 'timeEntry'
	| 'availability'
	| 'message'
	| 'question'
	| 'journal'
	| 'idea'
	| 'account'
	| 'link'
	| 'contact'
	| 'file'
	| 'reference'
	| 'activity'
	| 'aiNote';

export type ServerEvent =
	| { type: 'upsert'; entity: EntityName; projectId: string; data: unknown }
	| { type: 'delete'; entity: EntityName; projectId: string; id: string }
	| { type: 'presence'; projectId: string; userIds: string[] }
	| { type: 'notification'; data: unknown }
	| { type: 'timer'; data: unknown };

export type ClientEvent = { type: 'join'; projectId: string } | { type: 'ping' };
