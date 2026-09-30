import type { Idea } from '$lib/modules/ideas/domain/idea';
import { send } from '../commands';
import type { EntityName } from '$lib/modules/kernel/domain/realtime';
import { draftId, optimistic } from '../live/optimistic';
import type { ProjectStore } from '../project-store.svelte';
import { createOptimistically } from './create';

type IdeaInput = { title: string; note?: string; featureId?: string | null };

export function ideaActions(store: ProjectStore, meId: string) {
	const projectId = () => store.project.id;
	const target = (id: string) => ({ projectId: projectId(), id });
	const stamp = () => new Date().toISOString();
	const draft = (input: IdeaInput): Idea => ({
		id: draftId(),
		ref: 'I-…',
		kind: 'idea',
		projectId: projectId(),
		note: '',
		featureId: null,
		archivedAt: null,
		triagedAt: null,
		createdBy: meId,
		createdAt: stamp(),
		...input
	});
	/** The idea disappears at once; the created element is indexed without waiting for the echo. */
	const convert = async <T extends { id: string }>(
		id: string,
		entity: EntityName,
		request: () => Promise<T>
	) => {
		const created = await optimistic(() => store.ideas.remove(id), request);
		if (created) store.upsert(entity, created);
		return created;
	};
	return {
		create: (input: IdeaInput) =>
			createOptimistically(store, 'idea', draft(input), () =>
				send('ideas.create', { projectId: projectId(), ...input })
			),
		update: (id: string, changes: Partial<IdeaInput>) =>
			optimistic(
				() => store.ideas.patch(id, changes),
				() => send('ideas.update', { ...target(id), changes })
			),
		archive: (id: string, archived: boolean) =>
			optimistic(
				() => store.ideas.patch(id, { archivedAt: archived ? stamp() : null }),
				() => send('ideas.archive', { ...target(id), archived })
			),
		keep: (id: string) =>
			optimistic(
				() => store.ideas.patch(id, { triagedAt: stamp() }),
				() => send('ideas.keep', target(id))
			),
		remove: (id: string) =>
			optimistic(
				() => store.ideas.remove(id),
				() => send('ideas.delete', target(id))
			),
		toTask: (id: string) => convert(id, 'task', () => send('ideas.toTask', target(id))),
		toFeature: (id: string) => convert(id, 'feature', () => send('ideas.toFeature', target(id)))
	};
}
