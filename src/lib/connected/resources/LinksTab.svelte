<script lang="ts">
	import { Link2, Plus } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import Button from '$lib/ui/atoms/Button.svelte';
	import EmptyState from '$lib/ui/molecules/EmptyState.svelte';
	import LinkCreate from './LinkCreate.svelte';
	import LinkList from './LinkList.svelte';

	const { store } = useProject();
	let open = $state(false);
	const all = $derived(store.links.items.toSorted((a, b) => a.title.localeCompare(b.title)));
</script>

{#if all.length || open}
	<LinkCreate bind:open />
	{#if all.length}<LinkList {all} />{/if}
{:else}
	<EmptyState
		icon={Link2}
		title="Aucun lien pour l’instant"
		text="Maquettes, repo, doc d’API, tableau de bord… Un annuaire commun évite de fouiller l’historique de la discussion."
	>
		<Button variant="primary" size="sm" onclick={() => (open = true)}
			><Plus size={13} />Ajouter un lien</Button
		>
	</EmptyState>
{/if}
