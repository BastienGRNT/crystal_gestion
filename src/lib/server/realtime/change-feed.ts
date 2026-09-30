import type { ChangeFeed } from '$lib/modules/kernel/application/ports';
import type { TimerFeed } from '$lib/modules/time/application/ports';
import type { RealtimeHub } from './hub';

export const hubChangeFeed = (hub: RealtimeHub): ChangeFeed => ({
	upserted: (entity, projectId, data) =>
		hub.toProject(projectId, { type: 'upsert', entity, projectId, data }),
	deleted: (entity, projectId, id) =>
		hub.toProject(projectId, { type: 'delete', entity, projectId, id })
});

export const hubTimerFeed = (hub: RealtimeHub): TimerFeed => ({
	changed: (userId, timer) => hub.toUser(userId, { type: 'timer', data: timer })
});
