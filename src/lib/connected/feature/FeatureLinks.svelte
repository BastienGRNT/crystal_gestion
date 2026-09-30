<script lang="ts">
	import { useProject } from '$lib/client/context';
	import type { ElementBase } from '$lib/modules/kernel/domain/element';
	import Section from '$lib/ui/molecules/Section.svelte';
	import Backlinks from '../Backlinks.svelte';
	import LinkedElements from './LinkedElements.svelte';

	/** Side column of a feature page: its journal, attached resources and incoming references. */
	let { featureId }: { featureId: string } = $props();
	const { store } = useProject();
	const attached = <T extends ElementBase & { featureId: string | null }>(items: T[]) =>
		items.filter((item) => item.featureId === featureId);
	const journal = $derived(attached(store.journal.items));
	const extras = $derived([
		...attached(store.ideas.items),
		...attached(store.accounts.items),
		...attached(store.links.items),
		...attached(store.files.items)
	]);
</script>

<Section title="Journal" count={journal.length}>
	<LinkedElements items={journal} empty="Aucune décision ni bug résolu pour l’instant." />
</Section>
<Section title="Ressources liées" count={extras.length}>
	<LinkedElements items={extras} empty="Fichiers, liens, comptes et idées liés apparaîtront ici." />
</Section>
<Section title="Cité dans"><Backlinks id={featureId} heading={false} /></Section>
