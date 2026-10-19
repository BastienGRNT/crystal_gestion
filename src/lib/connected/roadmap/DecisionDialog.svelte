<script lang="ts">
	import { untrack } from 'svelte';
	import type { DecisionSeed } from '$lib/client/actions/roadmap';
	import { useApp } from '$lib/client/context';
	import { toasts } from '$lib/client/toasts.svelte';
	import Button from '$lib/ui/atoms/Button.svelte';
	import TextArea from '$lib/ui/atoms/TextArea.svelte';
	import Dialog from '$lib/ui/molecules/Dialog.svelte';
	import Field from '$lib/ui/molecules/Field.svelte';

	let { open = $bindable(), seed }: { open: boolean; seed: DecisionSeed } = $props();
	const { app, actions } = useApp();

	let text = $state('');
	let why = $state('');
	const replaced = $derived(app.decisions.get(seed.supersedes));

	$effect(() => {
		if (!open) return;
		untrack(() => {
			text = seed.text;
			why = seed.why ?? '';
		});
	});

	function submit(event: SubmitEvent) {
		event.preventDefault();
		if (!actions.roadmap.decide({ ...seed, text, why })) return;
		open = false;
		toasts.show('Décision notée', { tone: 'success', duration: 2500 });
	}
</script>

<Dialog
	bind:open
	title={replaced ? 'Remplacer la décision' : 'C’est décidé'}
	description={replaced
		? `L’ancienne reste visible, barrée : « ${replaced.text} »`
		: 'Elle rejoint la feuille de route et le compte rendu de la semaine. Entrée pour valider.'}
>
	<form id="decision-form" class="flex flex-col gap-4" onsubmit={submit}>
		<Field label="Ce qu’on a décidé" for="decision-text">
			<TextArea
				id="decision-text"
				bind:value={text}
				maxlength={280}
				placeholder="Ex. : pas d’app mobile avant 100 clients"
				{@attach (node) => {
					node.focus();
					(node as HTMLTextAreaElement).select();
				}}
				onkeydown={(e) => {
					if (e.key !== 'Enter' || e.shiftKey) return;
					e.preventDefault();
					e.currentTarget.form?.requestSubmit();
				}}
			/>
		</Field>
		<Field label="Pourquoi (facultatif)" for="decision-why">
			<TextArea
				id="decision-why"
				bind:value={why}
				maxlength={500}
				placeholder="Ce qui a fait pencher la balance"
			/>
		</Field>
	</form>
	{#snippet footer()}
		<Button variant="ghost" onclick={() => (open = false)}>Annuler</Button>
		<Button type="submit" form="decision-form" variant="primary" disabled={!text.trim()}
			>Noter la décision</Button
		>
	{/snippet}
</Dialog>
