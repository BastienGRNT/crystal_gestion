<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { isOpen } from '$lib/modules/ideas/domain/idea';
	import AddLine from '$lib/ui/molecules/AddLine.svelte';
	import GroupHeader from '$lib/ui/organisms/tasks/GroupHeader.svelte';
	import IdeaList from '../ideas/IdeaList.svelte';

	/** Outside the product: someone to call, a lead to follow. */
	const { store, actions } = useProject();
	let open = $state(true);
	let showArchived = $state(false);
	const ideas = $derived(store.ideas.items.filter(isOpen));
	const archived = $derived(store.ideas.items.filter((idea) => !isOpen(idea)));
</script>

<section class="mb-5">
	<GroupHeader
		title="Idées"
		meta="{ideas.length} · hors produit : contacter quelqu’un, une piste à creuser"
		{open}
		ontoggle={() => (open = !open)}
	/>
	{#if open}
		<div class="pt-1">
			<IdeaList {ideas} />
			<AddLine
				label="Noter une idée"
				placeholder="Ex. Contacter Intel pour présenter l’app"
				onadd={(title) => actions.ideas.create({ title })}
			/>
			{#if archived.length}
				<button
					type="button"
					onclick={() => (showArchived = !showArchived)}
					class="ml-2 text-xs text-ink-3 hover:text-ink"
					>{showArchived ? 'Masquer' : 'Voir'}
					{archived.length > 1 ? `les ${archived.length} archivées` : 'l’idée archivée'}</button
				>
				{#if showArchived}<IdeaList ideas={archived} />{/if}
			{/if}
		</div>
	{/if}
</section>
