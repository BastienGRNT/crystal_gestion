<script lang="ts">
	import { untrack } from 'svelte';
	import { useApp } from '$lib/client/context';
	import { shortDay } from '$lib/client/format';
	import type { Milestone } from '$lib/modules/roadmap/domain/milestone';
	import Button from '$lib/ui/atoms/Button.svelte';
	import TextArea from '$lib/ui/atoms/TextArea.svelte';
	import TextInput from '$lib/ui/atoms/TextInput.svelte';
	import Dialog from '$lib/ui/molecules/Dialog.svelte';
	import Field from '$lib/ui/molecules/Field.svelte';

	interface Props {
		open: boolean;
		projectId: string;
		/** Edits this step; adds a new one when absent. */
		step?: Milestone | null;
	}

	let { open = $bindable(), projectId, step = null }: Props = $props();
	const { actions } = useApp();

	let title = $state('');
	let doneWhen = $state('');
	let targetDate = $state('');
	let reason = $state('');

	$effect(() => {
		if (!open) return;
		untrack(() => {
			title = step?.title ?? '';
			doneWhen = step?.doneWhen ?? '';
			targetDate = step?.targetDate ?? '';
			reason = '';
		});
	});

	// Moving a date already promised is a decision: say why, in a few words.
	const moved = $derived(!!step?.targetDate && (targetDate || null) !== step.targetDate);

	function submit(event: SubmitEvent) {
		event.preventDefault();
		const fields = { title, doneWhen, targetDate: targetDate || null };
		if (step) actions.roadmap.updateStep(step.id, fields, reason);
		else if (!actions.roadmap.createStep(projectId, fields)) return;
		open = false;
	}
</script>

<Dialog
	bind:open
	title={step ? 'Modifier l’étape' : 'Nouvelle étape'}
	description={step
		? undefined
		: 'Un livrable, avec ce qui doit être vrai pour le dire fini. Les tâches viendront s’y ranger.'}
>
	<form id="step-form" class="flex flex-col gap-4" onsubmit={submit}>
		<Field label="Nom" for="step-title">
			<TextInput
				id="step-title"
				bind:value={title}
				required
				autofocus
				maxlength={60}
				placeholder="Ex. : Bêta privée"
			/>
		</Field>
		<Field label="C’est fini quand…" for="step-done-when" hint="Ce qu’on vérifie pour la clore.">
			<TextArea
				id="step-done-when"
				bind:value={doneWhen}
				maxlength={200}
				placeholder="Ex. : 5 kinés prennent de vrais rendez-vous"
			/>
		</Field>
		<Field
			label="Date cible (facultatif)"
			for="step-date"
			hint="Un budget : si ça déborde, on coupe ou on décide de décaler. Sans date, elle vient après les étapes datées."
		>
			<TextInput id="step-date" type="date" bind:value={targetDate} class="w-auto" />
		</Field>
		{#if moved}
			<Field
				label="Pourquoi la date change ? (facultatif)"
				for="step-reason"
				hint="Le report ({shortDay(step!.targetDate!)} → {targetDate
					? shortDay(targetDate)
					: 'sans date'}) est noté dans les décisions."
			>
				<TextInput
					id="step-reason"
					bind:value={reason}
					maxlength={500}
					placeholder="Ex. : l’intégration Google est plus dure que prévu"
				/>
			</Field>
		{/if}
	</form>
	{#snippet footer()}
		<Button variant="ghost" onclick={() => (open = false)}>Annuler</Button>
		<Button type="submit" form="step-form" variant="primary" disabled={!title.trim()}
			>{step ? 'Enregistrer' : 'Ajouter l’étape'}</Button
		>
	{/snippet}
</Dialog>
