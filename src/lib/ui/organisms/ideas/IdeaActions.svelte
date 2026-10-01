<script lang="ts">
	import {
		Archive,
		ArchiveRestore,
		Bookmark,
		Layers,
		SquareCheckBig,
		Trash2
	} from '@lucide/svelte';
	import IconButton from '../../atoms/IconButton.svelte';
	import type { IdeaHandlers } from './handlers';

	type Props = IdeaHandlers & { archived: boolean; untriaged?: boolean };
	let {
		archived,
		untriaged = false,
		ontask,
		onfeature,
		onarchive,
		onkeep,
		onremove
	}: Props = $props();
	const convert =
		'inline-flex h-7 items-center gap-1.5 rounded-[7px] border border-line px-2 text-xs font-medium transition hover:bg-hover';
</script>

<div class="flex shrink-0 items-center gap-1">
	{#if !archived}
		<button type="button" class={convert} onclick={ontask}><SquareCheckBig size={13} />Tâche</button
		>
		<button type="button" class={convert} onclick={onfeature}><Layers size={13} />Feature</button>
		{#if untriaged && onkeep}
			<button type="button" class={convert} onclick={onkeep}><Bookmark size={13} />Garder</button>
		{/if}
		<IconButton label="Archiver" size="sm" onclick={() => onarchive(true)}
			><Archive size={14} /></IconButton
		>
	{:else}
		<button type="button" class={convert} onclick={() => onarchive(false)}
			><ArchiveRestore size={13} />Restaurer</button
		>
		<IconButton label="Supprimer" size="sm" class="hover:text-danger" onclick={onremove}
			><Trash2 size={14} /></IconButton
		>
	{/if}
</div>
