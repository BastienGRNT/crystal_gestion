<script lang="ts">
	import { Layers } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import { overlays } from '$lib/client/overlays.svelte';
	import { byPriority, type Feature } from '$lib/modules/features/domain/feature';
	import { progressOf } from '$lib/modules/tasks/domain/progress';
	import EmptyState from '$lib/ui/molecules/EmptyState.svelte';
	import FeatureList from '$lib/ui/organisms/project/FeatureList.svelte';
	import WontFeatures from '$lib/ui/organisms/project/WontFeatures.svelte';
	import type { FeatureRowView } from '$lib/ui/types';

	const { store, actions, me } = useProject();
	const slug = $derived(store.project.slug);
	const toRow = (feature: Feature): FeatureRowView => {
		const tasks = store.tasks.items.filter((task) => task.featureId === feature.id);
		const progress = progressOf(tasks);
		return {
			...{ id: feature.id, ref: feature.ref, title: feature.title, priority: feature.priority },
			description: feature.description.split('\n')[0],
			owner: store.members.get(feature.ownerId ?? '') ?? null,
			...{ done: progress.done, total: progress.total },
			bugs: tasks.filter((task) => task.isFix && task.status !== 'done').length,
			href: `/p/${slug}/features/${feature.ref}`
		};
	};
	const rows = $derived([...store.features.items].sort(byPriority).map(toRow));
	const owners = (feature: FeatureRowView) =>
		store.members.items.map((m) => ({
			...{ value: m.id, label: m.id === me.id ? `${m.name} (moi)` : m.name, person: m },
			active: m.id === feature.owner?.id
		}));
	const wont = $derived(rows.filter((row) => row.priority === 'wont'));
</script>

{#if rows.length}
	<FeatureList
		features={rows}
		{owners}
		onpriority={(id, priority) => actions.features.update(id, { priority })}
		onowner={(id, ownerId) => actions.features.update(id, { ownerId })}
	/>
	{#if wont.length}
		<WontFeatures
			features={wont}
			onrestore={(id) => actions.features.update(id, { priority: 'could' })}
		/>
	{/if}
{:else}
	<EmptyState
		icon={Layers}
		title="Aucune feature"
		text="Une feature est un morceau du produit (ex. « Paiement Stripe »). Son fil de discussion et son dossier sont créés avec elle."
	>
		<button
			class="h-8 rounded-lg bg-accent px-3 text-ui font-medium text-accent-ink"
			onclick={() => overlays.openCreate('feature')}>Créer la première feature</button
		>
	</EmptyState>
{/if}
