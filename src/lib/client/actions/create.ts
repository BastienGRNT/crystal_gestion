import type { EntityName } from '$lib/modules/kernel/domain/realtime';
import { toasts } from '../toasts.svelte';
import type { ProjectStore } from '../project-store.svelte';

/** Shows the draft instantly, then swaps it for the server version (or removes it on failure). */
export async function createOptimistically<T extends { id: string }>(
	store: ProjectStore,
	entity: EntityName,
	draft: T,
	request: () => Promise<T>
): Promise<T | undefined> {
	store.upsert(entity, draft);
	try {
		const created = await request();
		store.remove(entity, draft.id);
		store.upsert(entity, created);
		return created;
	} catch (cause) {
		store.remove(entity, draft.id);
		toasts.error(cause instanceof Error ? cause.message : 'Création impossible');
		return undefined;
	}
}
