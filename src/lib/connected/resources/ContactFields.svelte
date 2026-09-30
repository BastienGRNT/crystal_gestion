<script lang="ts">
	import { BriefcaseBusiness, Copy, Mail, Phone, Send } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import type { Contact, ContactFields } from '$lib/modules/resources/domain/resources';
	import IconButton from '$lib/ui/atoms/IconButton.svelte';
	import IconLink from '$lib/ui/atoms/IconLink.svelte';
	import FieldLine from '$lib/ui/molecules/FieldLine.svelte';
	import { copy } from './clipboard';
	import NotesField from './NotesField.svelte';

	let { contact }: { contact: Contact } = $props();
	const { actions } = useProject();
	const save = (changes: Partial<ContactFields>) =>
		actions.resources.updateContact(contact.id, changes);
</script>

<div class="flex flex-col">
	<FieldLine
		icon={BriefcaseBusiness}
		label="Rôle"
		value={contact.role}
		placeholder="Rôle"
		onsave={(role) => save({ role })}
	/>
	<FieldLine
		icon={Mail}
		label="Email"
		value={contact.email}
		placeholder="Email"
		onsave={(email) => save({ email })}
	>
		{#snippet trailing()}
			<IconLink href="mailto:{contact.email}" label="Écrire un email"><Send size={13} /></IconLink>
			<IconButton size="sm" label="Copier l’email" onclick={() => copy(contact.email, 'Email')}
				><Copy size={13} /></IconButton
			>
		{/snippet}
	</FieldLine>
	<FieldLine
		icon={Phone}
		label="Téléphone"
		value={contact.phone}
		placeholder="Téléphone"
		mono
		onsave={(phone) => save({ phone })}
	>
		{#snippet trailing()}
			<IconLink href="tel:{contact.phone.replace(/[^\d+]/g, '')}" label="Appeler"
				><Phone size={13} /></IconLink
			>
			<IconButton size="sm" label="Copier le numéro" onclick={() => copy(contact.phone, 'Numéro')}
				><Copy size={13} /></IconButton
			>
		{/snippet}
	</FieldLine>
	<NotesField value={contact.notes} onsave={(notes) => save({ notes })} />
</div>
