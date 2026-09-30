<script lang="ts">
	import { page } from '$app/state';
	import { FileQuestion } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import type { ElementBase } from '$lib/modules/kernel/domain/element';
	import Backlinks from '$lib/connected/Backlinks.svelte';
	import Thread from '$lib/connected/discussion/Thread.svelte';
	import FeatureHeader from '$lib/connected/feature/FeatureHeader.svelte';
	import FeatureTasks from '$lib/connected/feature/FeatureTasks.svelte';
	import LinkedElements from '$lib/connected/feature/LinkedElements.svelte';
	import EmptyState from '$lib/ui/molecules/EmptyState.svelte';
	import InlineRichText from '$lib/ui/molecules/InlineRichText.svelte';
	import Section from '$lib/ui/molecules/Section.svelte';
	import Page from '$lib/ui/templates/Page.svelte';

	const { store, actions, refs } = useProject();
	const feature = $derived(store.features.items.find((f) => f.ref === page.params.ref));
	const attached = <T extends ElementBase & { featureId: string | null }>(items: T[]) =>
		items.filter((item) => item.featureId === feature?.id);
	const journal = $derived(attached(store.journal.items));
	const extras = $derived([...attached(store.ideas.items), ...attached(store.accounts.items), ...attached(store.links.items), ...attached(store.files.items)]);
</script>

<svelte:head><title>{feature?.title ?? 'Feature'} · {store.project.name}</title></svelte:head>

<Page width="max-w-6xl">
	{#if feature}
		<FeatureHeader {feature} />
		<div class="grid gap-x-12 lg:grid-cols-[minmax(0,1fr)_320px]">
			<div class="min-w-0">
				<Section title="Description">
					<InlineRichText value={feature.description} resolve={refs.resolve} suggest={refs.suggest} placeholder="Décris la feature…" onsave={(description) => actions.features.update(feature.id, { description })} />
				</Section>
				<Section title="C’est fini quand…">
					<InlineRichText value={feature.doneCriteria} resolve={refs.resolve} suggest={refs.suggest} placeholder="Les critères de « fini »" onsave={(doneCriteria) => actions.features.update(feature.id, { doneCriteria })} />
				</Section>
				<Section title="Tâches"><FeatureTasks featureId={feature.id} /></Section>
				<Section title="Discussion"><Thread featureId={feature.id} class="h-[600px]" /></Section>
			</div>
			<aside class="min-w-0">
				<Section title="Journal" count={journal.length}><LinkedElements items={journal} empty="Aucune décision ni fix pour l’instant." /></Section>
				<Section title="Ressources liées" count={extras.length}><LinkedElements items={extras} empty="Fichiers, liens, comptes et idées liés apparaîtront ici." /></Section>
				<Section title="Mentionné dans"><Backlinks id={feature.id} heading={false} /></Section>
			</aside>
		</div>
	{:else}
		<EmptyState icon={FileQuestion} title="Feature introuvable" text="Elle a peut-être été supprimée." />
	{/if}
</Page>
