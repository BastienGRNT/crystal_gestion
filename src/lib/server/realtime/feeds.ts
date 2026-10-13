import type { ChangeFeed } from '$lib/modules/kernel/application/ports';
import type { Inbox } from '$lib/modules/activity/application/ports';
import type { CollectionName, Collections, SavedEvent } from '$lib/shared/realtime';
import type { RealtimeHub } from './hub';

export function feedFor<K extends CollectionName>(
	hub: RealtimeHub,
	collection: K
): ChangeFeed<Collections[K]> {
	return {
		saved: (item) => hub.broadcast({ type: 'saved', collection, item } as SavedEvent),
		removed: (id) => hub.broadcast({ type: 'removed', collection, id })
	};
}

export const inboxFor = (hub: RealtimeHub): Inbox => ({
	deliver: (item) => hub.toUser(item.userId, { type: 'saved', collection: 'notifications', item })
});
