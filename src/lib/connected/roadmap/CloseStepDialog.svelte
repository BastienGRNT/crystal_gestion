<script lang="ts">
	import { untrack } from 'svelte';
	import { useApp } from '$lib/client/context';
	import { plural } from '$lib/client/format';
	import { nextMilestone, type Milestone } from '$lib/modules/roadmap/domain/milestone';
	import { isOpen } from '$lib/modules/tasks/domain/task';
	import Button from '$lib/ui/atoms/Button.svelte';
	import TextInput from '$lib/ui/atoms/TextInput.svelte';
	import Dialog from '$lib/ui/molecules/Dialog.svelte';
	import Field from '$lib/ui/molecules/Field.svelte';
	import Segmented from '$lib/ui/molecules/Segmented.svelte';

	let { open = $bindable(), step }: { open: boolean; step: Milestone } = $props();
	const { app, actions, overlays } = useApp();

	const next = $derived(
		nextMilestone(
			app.milestones.all.filter((m) => m.projectId === step.projectId),
			step.id
		)
	);
	const unfinished = $derived(app.tasks.all.filter((t) => t.milestoneId === step.id && isOpen(t)));
	let carry = $state<'next' | 'ideas'>('next');
	let note = $state('');
	let closing = $state(false);

	$effect(() => {
		if (!open) return;
		untrack(() => {
			carry = next ? 'next' : 'ideas';
			note = '';
		});
	});

	async function close(event: SubmitEvent) {
		event.preventDefault();
		closing = true;
		const done = await actions.roadmap.closeStep(step.id, next ? carry : 'ideas', note);
		closing = false;
		if (done) open = false;
	}

	function missing() {
		open = false;
		overlays.newTask({ projectId: step.projectId, milestoneId: step.id });
	}
</script>

<Dialog bind:open title="Clore « {step.title} »" size="sm">
	<form id="close-step" class="flex flex-col gap-4" onsubmit={close}>
		{#if step.doneWhen}
			<div class="rounded-xl bg-sunken px-4 py-3">
				<p class="text-sm font-semibold text-ink-2">C’est fini quand…</p>
				<p class="text-base">{step.doneWhen}</p>
				<p class="mt-1 text-sm text-ink-3">
					C’est le cas ? Sinon,
					<button
						type="button"
						class="font-medium text-accent-text hover:underline"
						onclick={missing}>ajoute ce qui manque</button
					>.
				</p>
			</div>
		{/if}

		{#if unfinished.length}
			<Field label="Il reste {plural(unfinished.length, 'tâche ouverte', 'tâches ouvertes')}">
				{#if next}
					<Segmented
						label="Que faire des tâches restantes"
						value={carry}
						onchange={(v) => (carry = v)}
						stretch
						options={[
							{ value: 'next', label: `Vers « ${next.title} »` },
							{ value: 'ideas', label: 'En pistes' }
						]}
					/>
				{/if}
				<p class="text-sm text-ink-3">
					{carry === 'next' && next
						? 'Elles passent à l’étape suivante, telles quelles.'
						: 'Elles retournent dans les idées, sans étape.'}
					C’est noté dans les décisions.
				</p>
			</Field>
		{/if}

		<Field label="À changer pour la suite (facultatif)" for="close-note">
			<TextInput
				id="close-note"
				bind:value={note}
				maxlength={200}
				placeholder="Une ligne, si quelque chose vous a ralentis"
			/>
		</Field>
		<p class="text-sm text-ink-3">
			Le bilan (dates, tâches, décisions) part dans #général, écrit par Crystal.
		</p>
	</form>
	{#snippet footer()}
		<Button variant="ghost" onclick={() => (open = false)}>Annuler</Button>
		<Button type="submit" form="close-step" variant="primary" loading={closing}
			>Clore l’étape</Button
		>
	{/snippet}
</Dialog>
