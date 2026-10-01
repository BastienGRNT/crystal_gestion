<script lang="ts">
	import { Contact, Plus } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import Button from '$lib/ui/atoms/Button.svelte';
	import EmptyState from '$lib/ui/molecules/EmptyState.svelte';
	import QuickCreate from '$lib/ui/organisms/QuickCreate.svelte';
	import ContactCard from './ContactCard.svelte';

	const { store, actions } = useProject();
	let open = $state(false);
	const contacts = $derived(
		store.contacts.items.toSorted((a, b) => a.title.localeCompare(b.title))
	);
</script>

{#if contacts.length || open}
	<QuickCreate
		bind:open
		label="Ajouter un contact"
		fields={[
			{ key: 'title', label: 'Nom', placeholder: 'Nom — Claire Martin' },
			{ key: 'role', label: 'Rôle', placeholder: 'Rôle — cliente, comptable…' },
			{ key: 'email', label: 'Email', type: 'email' },
			{ key: 'phone', label: 'Téléphone', type: 'tel', mono: true },
			{ key: 'notes', label: 'Notes', wide: true }
		]}
		onsubmit={(values) => actions.resources.createContact({ ...values, title: values.title })}
	/>
{:else}
	<EmptyState
		icon={Contact}
		title="Aucun contact"
		text="Client, freelance, support d’un service… Garde ici les personnes à joindre, avec leur rôle et comment les contacter."
	>
		<Button variant="primary" size="sm" onclick={() => (open = true)}
			><Plus size={13} />Ajouter un contact</Button
		>
	</EmptyState>
{/if}
<div class="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
	{#each contacts as contact (contact.id)}<ContactCard {contact} />{/each}
</div>
