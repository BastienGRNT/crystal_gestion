<script lang="ts">
	import { untrack } from 'svelte';
	import { Lightbulb } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import { overlays } from '$lib/client/overlays.svelte';
	import FormField from '$lib/ui/molecules/form/FormField.svelte';
	import TextField from '$lib/ui/molecules/form/TextField.svelte';
	import FormDialog from '$lib/ui/organisms/FormDialog.svelte';
	import { emptyDraft } from './create-draft';
	import { created } from './created';

	const { actions, me } = useProject();
	const opened = untrack(() => overlays.create!);
	let draft = $state(emptyDraft(opened.seed, me.id));
	const close = () => (overlays.create = null);

	async function submit() {
		const title = draft.title.trim();
		if (!title) return;
		close();
		created(await actions.ideas.create({ title, note: draft.body.trim() }), 'Idée notée');
	}
</script>

<FormDialog
	title="Nouvelle idée"
	submitLabel="Noter l’idée"
	disabled={!draft.title.trim()}
	note="Hors produit. Une idée de Feat va dans l’Icebox."
	width="max-w-[560px]"
	onsubmit={submit}
	onclose={close}
>
	{#snippet lead()}<Lightbulb size={22} class="text-should" />{/snippet}
	<FormField label="L’idée en une phrase">
		<TextField
			main
			bind:value={draft.title}
			placeholder="Ex. Contacter Intel pour présenter l’app"
			onenter={submit}
		/>
	</FormField>
	<FormField label="Une note" optional>
		<TextField bind:value={draft.body} rows={3} placeholder="Qui, pourquoi, un lien…" />
	</FormField>
</FormDialog>
