<script lang="ts">
	import { useProject } from '$lib/client/context';
	import type { Contact } from '$lib/modules/resources/domain/resources';
	import CardHeader from './CardHeader.svelte';
	import ContactFields from './ContactFields.svelte';

	let { contact }: { contact: Contact } = $props();
	const { actions } = useProject();
</script>

<article
	class="group flex animate-rise flex-col rounded-lg border border-line bg-surface p-4 transition hover:border-line-strong"
>
	<CardHeader
		title={contact.title}
		ref={contact.ref}
		person
		onrename={(title) => actions.resources.updateContact(contact.id, { title })}
		onremove={() => actions.resources.removeContact(contact.id)}
	/>
	<div class="mt-3 border-t border-line pt-2"><ContactFields {contact} /></div>
</article>
