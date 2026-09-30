<script lang="ts">
	import { KeyRound, Plus } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import Button from '$lib/ui/atoms/Button.svelte';
	import EmptyState from '$lib/ui/molecules/EmptyState.svelte';
	import AccountCard from './AccountCard.svelte';
	import AccountCreate from './AccountCreate.svelte';

	const { store } = useProject();
	let open = $state(false);
	const accounts = $derived(
		store.accounts.items.toSorted((a, b) => a.title.localeCompare(b.title))
	);
</script>

{#if accounts.length || open}
	<AccountCreate bind:open />
{:else}
	<EmptyState
		icon={KeyRound}
		title="Aucun compte partagé"
		text="Stripe, hébergeur, nom de domaine… Range ici les accès que toute l’équipe utilise, au lieu de les chercher dans une conversation."
	>
		<Button variant="primary" size="sm" onclick={() => (open = true)}
			><Plus size={13} />Ajouter un compte</Button
		>
	</EmptyState>
{/if}
<div class="mt-4 grid gap-3 md:grid-cols-2">
	{#each accounts as account (account.id)}<AccountCard {account} />{/each}
</div>
