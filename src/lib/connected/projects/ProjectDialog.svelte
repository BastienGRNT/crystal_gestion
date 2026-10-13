<script lang="ts">
	import { untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import { useApp } from '$lib/client/context';
	import type { Project } from '$lib/modules/projects/domain/project';
	import Button from '$lib/ui/atoms/Button.svelte';
	import ColorPicker from '$lib/ui/atoms/ColorPicker.svelte';
	import TextArea from '$lib/ui/atoms/TextArea.svelte';
	import TextInput from '$lib/ui/atoms/TextInput.svelte';
	import Dialog from '$lib/ui/molecules/Dialog.svelte';
	import Field from '$lib/ui/molecules/Field.svelte';

	interface Props {
		open: boolean;
		/** Edits this project; creates a new one when absent. */
		project?: Project;
	}

	let { open = $bindable(), project }: Props = $props();
	const { app, actions } = useApp();

	let name = $state('');
	let description = $state('');
	let color = $state(0);
	let deadline = $state('');

	// Filled when the dialog opens only: live updates must not overwrite what is being typed.
	$effect(() => {
		if (!open) return;
		untrack(() => {
			name = project?.name ?? '';
			description = project?.description ?? '';
			color = project?.color ?? app.projects.size % 8;
			deadline = project?.deadline ?? '';
		});
	});

	let saving = $state(false);

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		const fields = { name, description, color, deadline: deadline || null };
		if (project) {
			actions.projects.update(project.id, fields);
			open = false;
			return;
		}
		saving = true;
		const created = await actions.projects.create(fields);
		saving = false;
		if (!created) return;
		open = false;
		void goto(`/p/${created.slug}`);
	}
</script>

<Dialog
	bind:open
	title={project ? 'Modifier le projet' : 'Nouveau projet'}
	description={project
		? undefined
		: 'Il aura son équipe, son tableau, sa discussion, son planning, ses documents et ses accès. Tu pourras inviter juste après.'}
>
	<form id="project-form" class="flex flex-col gap-4" onsubmit={submit}>
		<Field label="Nom" for="project-name">
			<TextInput
				id="project-name"
				bind:value={name}
				placeholder="Ex. : Site de l’atelier"
				required
				autofocus
				maxlength={60}
			/>
		</Field>
		<Field label="En une phrase (facultatif)" for="project-description">
			<TextArea
				id="project-description"
				bind:value={description}
				placeholder="Ce qu’on construit, et pour qui"
				maxlength={500}
			/>
		</Field>
		<Field
			label="Date de livraison (facultatif)"
			for="project-deadline"
			hint="Elle apparaît dans le planning."
		>
			<TextInput id="project-deadline" type="date" bind:value={deadline} class="w-auto" />
		</Field>
		<Field label="Couleur">
			<ColorPicker value={color} onchange={(c) => (color = c)} />
		</Field>
	</form>
	{#snippet footer()}
		<Button variant="ghost" onclick={() => (open = false)}>Annuler</Button>
		<Button type="submit" form="project-form" variant="primary" loading={saving}
			>{project ? 'Enregistrer' : 'Créer le projet'}</Button
		>
	{/snippet}
</Dialog>
