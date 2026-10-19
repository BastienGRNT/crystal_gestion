<script lang="ts">
	import { untrack } from 'svelte';
	import { useApp } from '$lib/client/context';
	import { now } from '$lib/client/now.svelte';
	import type { Project } from '$lib/modules/projects/domain/project';
	import type { TemplateKey } from '$lib/modules/roadmap/domain/templates';
	import Button from '$lib/ui/atoms/Button.svelte';
	import TextInput from '$lib/ui/atoms/TextInput.svelte';
	import Dialog from '$lib/ui/molecules/Dialog.svelte';
	import Field from '$lib/ui/molecules/Field.svelte';
	import TemplatePicker from '$lib/ui/molecules/TemplatePicker.svelte';
	import { suggestedTemplate, templateOptions } from './templates';

	let { open = $bindable(), project }: { open: boolean; project: Project } = $props();
	const { actions } = useApp();

	let deadline = $state('');
	let picked = $state<TemplateKey | null>(null);
	let saving = $state(false);
	const template = $derived(picked ?? suggestedTemplate(deadline || null, now.today));

	$effect(() => {
		if (!open) return;
		untrack(() => {
			deadline = project.deadline ?? '';
			picked = null;
		});
	});

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		const date = deadline || null;
		if (date !== project.deadline) actions.projects.update(project.id, { deadline: date });
		saving = true;
		const done = await actions.roadmap.applyTemplate(project.id, template, date);
		saving = false;
		if (done) open = false;
	}
</script>

<Dialog
	bind:open
	size="lg"
	title="Partir d’un modèle"
	description="Les étapes et leurs tâches types s’ajoutent au projet. Tes tâches actuelles ne bougent pas."
>
	<form id="template-form" class="flex flex-col gap-4" onsubmit={submit}>
		<TemplatePicker
			options={templateOptions(false)}
			value={template}
			onchange={(key) => (picked = key)}
		/>
		<Field
			label="Date de livraison"
			for="template-deadline"
			hint="Les étapes se datent d’ici là. Sans date, elles restent sans date : tu les dateras quand tu les verras venir."
		>
			<TextInput id="template-deadline" type="date" bind:value={deadline} class="w-auto" />
		</Field>
	</form>
	{#snippet footer()}
		<Button variant="ghost" onclick={() => (open = false)}>Annuler</Button>
		<Button type="submit" form="template-form" variant="primary" loading={saving}
			>Poser les étapes</Button
		>
	{/snippet}
</Dialog>
