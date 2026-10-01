<script lang="ts">
	import { SearchX } from '@lucide/svelte';
	import { linkTags } from '$lib/modules/resources/domain/link';
	import type { Link } from '$lib/modules/resources/domain/resources';
	import EmptyState from '$lib/ui/molecules/EmptyState.svelte';
	import LinkFilters from './LinkFilters.svelte';
	import LinkRow from './LinkRow.svelte';

	let { all }: { all: Link[] } = $props();
	let tag = $state<string | null>(null);
	let featureId = $state('');
	const tags = $derived([...new Set(all.flatMap((link) => linkTags(link.tag)))].sort());
	const links = $derived(
		all.filter(
			(link) =>
				(!tag || linkTags(link.tag).includes(tag)) && (!featureId || link.featureId === featureId)
		)
	);
</script>

<div class="mt-5">
	<LinkFilters
		{tags}
		{tag}
		{featureId}
		ontag={(next) => (tag = next)}
		onfeature={(id) => (featureId = id)}
	/>
</div>
{#if links.length}
	<ul class="mt-3 divide-y divide-line rounded-[16px] border-[1.5px] border-line bg-surface">
		{#each links as link (link.id)}<LinkRow {link} ontag={(next) => (tag = next)} />{/each}
	</ul>
{:else}
	<div class="mt-3">
		<EmptyState
			icon={SearchX}
			title="Aucun lien pour ce filtre"
			text="Change de tag ou de Feat pour élargir la recherche."
		/>
	</div>
{/if}
