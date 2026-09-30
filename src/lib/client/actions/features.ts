import type { Feature, FeatureFields } from '$lib/modules/features/domain/feature';
import { send } from '../commands';
import { draftId, optimistic } from '../live/optimistic';
import type { ProjectStore } from '../project-store.svelte';
import { createOptimistically } from './create';

export function featureActions(store: ProjectStore) {
	const projectId = () => store.project.id;
	const draft = (input: Partial<FeatureFields> & { title: string }): Feature => ({
		id: draftId(),
		ref: 'F-…',
		kind: 'feature',
		projectId: projectId(),
		description: '',
		priority: 'should',
		ownerId: null,
		doneCriteria: '',
		createdAt: new Date().toISOString(),
		...input
	});
	return {
		create: (input: Partial<FeatureFields> & { title: string }) =>
			createOptimistically(store, 'feature', draft(input), () =>
				send('features.create', { projectId: projectId(), ...input })
			),
		update: (id: string, changes: Partial<FeatureFields>) =>
			optimistic(
				() => store.features.patch(id, changes),
				() => send('features.update', { projectId: projectId(), id, changes })
			),
		remove: (id: string) =>
			optimistic(
				() => store.features.remove(id),
				() => send('features.delete', { projectId: projectId(), id })
			)
	};
}
