<script lang="ts">
	import { useProject } from '$lib/client/context';
	import Select from '$lib/ui/atoms/Select.svelte';
	import Tag from '$lib/ui/atoms/Tag.svelte';
	import { featureOptions } from './options';

	interface Props {
		tags: string[];
		tag: string | null;
		featureId: string;
		ontag: (tag: string | null) => void;
		onfeature: (featureId: string) => void;
	}

	let { tags, tag, featureId, ontag, onfeature }: Props = $props();
	const { store } = useProject();
</script>

<div class="flex flex-wrap items-center gap-x-3 gap-y-2">
	<div class="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
		<span class="mr-1 text-xs text-ink-3">Tags</span>
		<button
			type="button"
			onclick={() => ontag(null)}
			class="h-5 rounded-[4px] px-1.5 text-xs transition {tag === null
				? 'bg-ink text-bg'
				: 'text-ink-3 hover:text-ink'}">Tous</button
		>
		{#each tags as each (each)}
			<Tag tag={each} active={each === tag} onclick={() => ontag(each === tag ? null : each)} />
		{:else}
			<span class="text-xs text-ink-3/80">aucun pour l’instant</span>
		{/each}
	</div>
	<Select
		label="Filtrer par feature"
		value={featureId}
		options={featureOptions(store.features.items, 'Toutes les features')}
		onchange={onfeature}
		class="w-56 max-w-full rounded-md border border-line bg-surface"
	/>
</div>
