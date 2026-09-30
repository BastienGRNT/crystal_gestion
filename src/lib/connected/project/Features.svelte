<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { byPriority } from '$lib/modules/features/domain/feature';
	import { progressOf } from '$lib/modules/tasks/domain/progress';
	import FeatureList from '$lib/ui/organisms/project/FeatureList.svelte';
	import type { FeatureRowView } from '$lib/ui/types';

	const { store, actions } = useProject();
	const slug = $derived(store.project.slug);
	const active = $derived(store.features.items.filter((f) => f.priority !== 'wont').sort(byPriority));
	const rows = $derived(
		active.map((feature): FeatureRowView => {
			const progress = progressOf(store.tasks.items.filter((task) => task.featureId === feature.id));
			return {
				id: feature.id,
				ref: feature.ref,
				title: feature.title,
				priority: feature.priority,
				owner: store.members.get(feature.ownerId ?? '') ?? null,
				done: progress.done,
				total: progress.total,
				href: `/p/${slug}/features/${feature.ref}`
			};
		})
	);
</script>

<FeatureList
	features={rows}
	wontCount={store.features.items.length - active.length}
	wontHref="/p/{slug}/ideas"
	onpriority={(id, priority) => actions.features.update(id, { priority })}
	onadd={(title, priority) => actions.features.create({ title, priority })}
/>
