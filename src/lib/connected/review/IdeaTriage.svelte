<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { needsTriage } from '$lib/modules/ideas/domain/idea';
	import TriageRow from '$lib/ui/organisms/review/TriageRow.svelte';

	const { store, actions } = useProject();
	const pending = $derived(store.ideas.items.filter(needsTriage));
</script>

{#each pending as idea (idea.id)}
	<TriageRow
		title={idea.title}
		ref={idea.ref}
		ontask={() => actions.ideas.toTask(idea.id)}
		onfeature={() => actions.ideas.toFeature(idea.id)}
		onkeep={() => actions.ideas.keep(idea.id)}
		ondelete={() => actions.ideas.remove(idea.id)}
	/>
{:else}
	<p class="text-[13px] text-ink-3">Aucune idée en attente de tri.</p>
{/each}
