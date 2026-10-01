<script lang="ts">
	import { Archive, ArchiveRestore, Trash2 } from '@lucide/svelte';
	import IconButton from '../../atoms/IconButton.svelte';
	import type { IdeaHandlers } from './handlers';

	type Props = IdeaHandlers & { archived: boolean };
	let { archived, ontask, onfeature, onarchive, onremove }: Props = $props();
	const convert =
		'inline-flex h-7 items-center rounded-md px-2 text-xs font-medium text-ink-2 transition hover:bg-sunken hover:text-ink';
</script>

<div class="flex shrink-0 items-center gap-0.5">
	{#if !archived}
		<button type="button" class={convert} onclick={ontask} title="En faire une tâche"
			>→ Tâche</button
		>
		<button type="button" class={convert} onclick={onfeature} title="En faire une feature"
			>→ Feature</button
		>
		<IconButton label="Archiver" size="sm" onclick={() => onarchive(true)}
			><Archive size={14} /></IconButton
		>
	{:else}
		<button type="button" class={convert} onclick={() => onarchive(false)}
			><ArchiveRestore size={13} class="mr-1" />Restaurer</button
		>
		<IconButton label="Supprimer" size="sm" class="hover:text-danger" onclick={onremove}
			><Trash2 size={14} /></IconButton
		>
	{/if}
</div>
