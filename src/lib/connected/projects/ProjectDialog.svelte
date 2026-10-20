<script lang="ts">
	import { untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import { useApp } from '$lib/client/context';
	import type { Project, ProjectKind } from '$lib/modules/projects/domain/project';
	import { PROJECT_KIND_LABELS } from '$lib/client/labels';
	import Segmented from '$lib/ui/molecules/Segmented.svelte';
	import Button from '$lib/ui/atoms/Button.svelte';
	import ColorPicker from '$lib/ui/atoms/ColorPicker.svelte';
	import TextArea from '$lib/ui/atoms/TextArea.svelte';
	import TextInput from '$lib/ui/atoms/TextInput.svelte';
	import Dialog from '$lib/ui/molecules/Dialog.svelte';
	import Field from '$lib/ui/molecules/Field.svelte';
	import TemplatePicker from '$lib/ui/molecules/TemplatePicker.svelte';
	import { now } from '$lib/client/now.svelte';
	import type { TemplateKey } from '$lib/modules/roadmap/domain/templates';
	import { suggestedTemplate, templateOptions } from '../roadmap/templates';

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
	let kind = $state<ProjectKind>('product');
	// Suggested from the delivery date until someone picks one.
	let picked = $state<TemplateKey | null>(null);
	const template = $derived(picked ?? suggestedTemplate(deadline || null, now.today));

	// Filled when the dialog opens only: live updates must not overwrite what is being typed.
	$effect(() => {
		if (!open) return;
		untrack(() => {
			name = project?.name ?? '';
			description = project?.description ?? '';
			color = project?.color ?? app.projects.size % 8;
			deadline = project?.deadline ?? '';
			kind = project?.kind ?? 'product';
			picked = null;
		});
	});

	let saving = $state(false);

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		const fields = { name, description, color, deadline: deadline || null };
		if (project) {
			actions.projects.update(project.id, { ...fields, kind });
			open = false;
			return;
		}
		saving = true;
		// The template is the kind of project: it sets how much framing is worth asking for.
		const created = await actions.projects.create({
			...fields,
			kind: template === 'empty' ? 'product' : template
		});
		if (created) await actions.roadmap.applyTemplate(created.id, template, created.deadline);
		saving = false;
		if (!created) return;
		open = false;
		void goto(`/p/${created.slug}/demarrer`);
	}
</script>

<Dialog
	bind:open
	size={project ? 'md' : 'lg'}
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
			hint="Les étapes du modèle se datent d’ici là. Elle apparaît dans le planning."
		>
			<TextInput id="project-deadline" type="date" bind:value={deadline} class="w-auto" />
		</Field>
		{#if !project}
			<Field
				label="Type de projet"
				hint="Il pose les étapes et les tâches qu’on oublie toujours (mise en ligne, RGPD…). Tout reste modifiable."
			>
				<TemplatePicker
					options={templateOptions()}
					value={template}
					onchange={(key) => (picked = key)}
				/>
			</Field>
		{/if}
		{#if project}
			<Field label="Type de projet" hint={PROJECT_KIND_LABELS[kind].hint}>
				<Segmented
					label="Type de projet"
					value={kind}
					options={Object.entries(PROJECT_KIND_LABELS).map(([value, k]) => ({
						value: value as ProjectKind,
						label: k.label
					}))}
					onchange={(k) => (kind = k)}
				/>
			</Field>
		{/if}
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
