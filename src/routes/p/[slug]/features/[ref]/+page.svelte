<script lang="ts">
	import { page } from '$app/state';
	import { FileQuestion } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import Thread from '$lib/connected/discussion/Thread.svelte';
	import FeatureHeader from '$lib/connected/feature/FeatureHeader.svelte';
	import FeatureTasks from '$lib/connected/feature/FeatureTasks.svelte';
	import FeatureLinks from '$lib/connected/feature/FeatureLinks.svelte';
	import EmptyState from '$lib/ui/molecules/EmptyState.svelte';
	import InlineRichText from '$lib/ui/molecules/InlineRichText.svelte';
	import Section from '$lib/ui/molecules/Section.svelte';
	import Page from '$lib/ui/templates/Page.svelte';

	const { store, actions, refs } = useProject();
	const feature = $derived(store.features.items.find((f) => f.ref === page.params.ref));
</script>

<svelte:head><title>{feature?.title ?? 'Feature'} · {store.project.name}</title></svelte:head>

<Page>
	{#if feature}
		<FeatureHeader {feature} />
		<div class="grid gap-x-12 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]">
			<div class="min-w-0">
				<Section title="Description">
					<InlineRichText
						value={feature.description}
						resolve={refs.resolve}
						suggest={refs.suggest}
						placeholder="Décris la feature…"
						onsave={(description) => actions.features.update(feature.id, { description })}
					/>
				</Section>
				<Section title="C’est fini quand…">
					<InlineRichText
						value={feature.doneCriteria}
						resolve={refs.resolve}
						suggest={refs.suggest}
						placeholder="Les critères de « fini »"
						onsave={(doneCriteria) => actions.features.update(feature.id, { doneCriteria })}
					/>
				</Section>
				<Section title="Tâches"><FeatureTasks featureId={feature.id} /></Section>
				<Section title="Discussion"><Thread featureId={feature.id} class="h-[600px]" /></Section>
			</div>
			<aside class="min-w-0"><FeatureLinks featureId={feature.id} /></aside>
		</div>
	{:else}
		<EmptyState
			icon={FileQuestion}
			title="Feature introuvable"
			text="Elle a peut-être été supprimée."
		>
			<a href="/p/{store.project.slug}/project" class="font-medium text-accent-text hover:underline"
				>Voir toutes les features</a
			>
		</EmptyState>
	{/if}
</Page>
