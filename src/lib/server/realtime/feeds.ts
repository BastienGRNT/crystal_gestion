import type { Inbox } from '$lib/modules/activity/application/ports';
import type { ChangeFeed } from '$lib/modules/kernel/application/ports';
import type { CollectionName, Collections, RemovedEvent, SavedEvent } from '$lib/shared/realtime';
import type { RealtimeHub } from './hub';

/** Who hears about an item: its project's team, one person, or a person's teammates. */
export type Route = { project: string } | { user: string } | { teammatesOf: string };

export function feedFor<K extends CollectionName>(
	hub: RealtimeHub,
	collection: K,
	route: (item: Collections[K]) => Route
): ChangeFeed<Collections[K]> {
	const send = (item: Collections[K], event: SavedEvent | RemovedEvent) => {
		const to = route(item);
		if ('project' in to) hub.toProject(to.project, event);
		else if ('user' in to) hub.toUser(to.user, event);
		else hub.toTeammatesOf(to.teammatesOf, event);
	};
	return {
		saved: (item) => send(item, { type: 'saved', collection, item } as SavedEvent),
		removed: (item) => send(item, { type: 'removed', collection, item } as RemovedEvent)
	};
}

export const byProject = (item: { projectId: string }): Route => ({ project: item.projectId });

export const inboxFor = (hub: RealtimeHub): Inbox => ({
	deliver: (item) => hub.toUser(item.userId, { type: 'saved', collection: 'notifications', item })
});
