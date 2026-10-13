<script lang="ts">
	import { goto } from '$app/navigation';
	import { useApp } from '$lib/client/context';
	import Button from '$lib/ui/atoms/Button.svelte';
	import TextInput from '$lib/ui/atoms/TextInput.svelte';
	import Dialog from '$lib/ui/molecules/Dialog.svelte';
	import Field from '$lib/ui/molecules/Field.svelte';

	let { open = $bindable(), projectId }: { open: boolean; projectId: string } = $props();
	const { app, actions } = useApp();
	let name = $state('');

	$effect(() => {
		if (open) name = '';
	});

	function submit(event: SubmitEvent) {
		event.preventDefault();
		const channel = actions.chat.createChannel(projectId, name);
		const slug = app.projects.get(projectId)?.slug;
		if (!channel || !slug) return;
		open = false;
		void goto(`/p/${slug}/discussion/${channel.id}`);
	}
</script>

<Dialog
	bind:open
	size="sm"
	title="Nouveau canal"
	description="Pour parler d’un sujet sans noyer le reste : la mise en prod, le design, les retours du client…"
>
	<form id="channel-form" onsubmit={submit}>
		<Field label="Nom du canal" for="channel-name">
			<TextInput
				id="channel-name"
				bind:value={name}
				placeholder="Ex. : mise-en-prod"
				required
				autofocus
				maxlength={40}
			/>
		</Field>
	</form>
	{#snippet footer()}
		<Button variant="ghost" onclick={() => (open = false)}>Annuler</Button>
		<Button type="submit" form="channel-form" variant="primary">Créer le canal</Button>
	{/snippet}
</Dialog>
