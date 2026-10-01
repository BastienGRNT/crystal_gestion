import type { ThreadKey } from '$lib/modules/discussion/domain/channel';
import type { Message } from '$lib/modules/discussion/domain/message';
import type { ProjectStore } from '$lib/client/project-store.svelte';

/** Threads are not part of the snapshot: fetched on open, then kept live by realtime events. */
export async function loadThread(store: ProjectStore, { featureId, channelId }: ThreadKey) {
	const query = new URLSearchParams();
	if (featureId) query.set('featureId', featureId);
	if (channelId) query.set('channelId', channelId);
	const response = await fetch(`/api/projects/${store.project.id}/threads?${query}`);
	if (!response.ok) throw new Error('Impossible de charger la discussion');
	const messages: Message[] = await response.json();
	for (const message of messages) store.upsert('message', message);
}

/** The messages citing an element, from any thread. */
export async function loadAbout(store: ProjectStore, elementId: string) {
	const response = await fetch(`/api/projects/${store.project.id}/threads?about=${elementId}`);
	if (!response.ok) throw new Error('Impossible de charger la discussion');
	const messages: Message[] = await response.json();
	for (const message of messages) store.upsert('message', message);
}

export const byCreatedAt = (a: Message, b: Message) => a.createdAt.localeCompare(b.createdAt);
