<script lang="ts">
	import { Lightbulb } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import { overlays } from '$lib/client/overlays.svelte';
	import Button from '$lib/ui/atoms/Button.svelte';
	import Kbd from '$lib/ui/atoms/Kbd.svelte';
	import RefTextArea from '$lib/ui/molecules/RefTextArea.svelte';
	import Dialog from '$lib/ui/organisms/Dialog.svelte';
	import { toasts } from '$lib/client/toasts.svelte';

	const { actions, refs } = useProject();
	let title = $state(overlays.ideaSeed);
	let note = $state('');

	function save() {
		if (!title.trim()) return;
		actions.ideas.create({ title: title.trim(), note: note.trim() });
		toasts.success('Idée notée');
		overlays.idea = false;
	}
</script>

<Dialog label="Noter une idée" onclose={() => (overlays.idea = false)}>
	<div class="flex items-center gap-2 text-xs text-ink-3">
		<Lightbulb size={14} class="text-should" /> Idée · plus tard
	</div>
	<!-- svelte-ignore a11y_autofocus -->
	<input
		bind:value={title}
		autofocus
		placeholder="L’idée en quelques mots"
		onkeydown={(event) => event.key === 'Enter' && save()}
		class="mt-3 w-full bg-transparent font-display text-3xl leading-tight outline-none placeholder:text-ink-3"
	/>
	<RefTextArea
		bind:value={note}
		suggest={refs.suggest}
		placeholder="Une note ? (optionnel, # pour lier)"
		class="mt-2 min-h-12 text-ink-2"
	/>
	<div class="mt-4 flex items-center justify-end gap-3">
		<span class="text-xs text-ink-3"><Kbd>↵</Kbd> pour enregistrer</span>
		<Button variant="primary" onclick={save} disabled={!title.trim()}>Noter</Button>
	</div>
</Dialog>
