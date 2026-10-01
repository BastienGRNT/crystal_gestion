<script lang="ts">
	import { useProject } from '$lib/client/context';
	import type { ElementBase } from '$lib/modules/kernel/domain/element';
	import Section from '$lib/ui/molecules/Section.svelte';
	import LinkedElements from './LinkedElements.svelte';

	/** What else hangs on the feature: decisions, ideas, resources, and what cites it. Shown when there is some. */
	let { featureId }: { featureId: string } = $props();
	const { store, refs } = useProject();
	const attached = <T extends ElementBase & { featureId: string | null }>(items: T[]) =>
		items.filter((item) => item.featureId === featureId);
	const journal = $derived(attached(store.journal.items));
	const extras = $derived([
		...attached(store.ideas.items),
		...attached(store.accounts.items),
		...attached(store.links.items)
	]);
	const citing = $derived(refs.backlinks(featureId).filter((e) => e.kind !== 'message'));
</script>

{#if journal.length}
	<Section title="Décisions" count={journal.length}>
		<LinkedElements items={journal} empty="" />
	</Section>
{/if}
{#if extras.length}
	<Section title="Ressources et idées liées" count={extras.length}>
		<LinkedElements items={extras} empty="" />
	</Section>
{/if}
{#if citing.length}
	<Section title="Cité dans" count={citing.length}>
		<LinkedElements items={citing} empty="" />
	</Section>
{/if}
