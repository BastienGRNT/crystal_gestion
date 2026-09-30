<script lang="ts">
	import { Archive, ArchiveRestore, ArrowRight, Trash2 } from '@lucide/svelte';
	import IconButton from '../../atoms/IconButton.svelte';
	import type { IdeaHandlers } from './handlers';

	type Props = IdeaHandlers & { archived: boolean };
	let { archived, ontask, onfeature, onarchive, onremove }: Props = $props();
	const convert =
		'inline-flex h-7 items-center gap-1 rounded-md px-2 text-sm font-medium text-ink-2 transition hover:bg-accent-soft hover:text-accent';
</script>

<div class="flex shrink-0 items-center gap-0.5">
	{#if !archived}
		<button type="button" class={convert} onclick={ontask}><ArrowRight size={13} />Tâche</button>
		<button type="button" class={convert} onclick={onfeature}
			><ArrowRight size={13} />Feature</button
		>
		<IconButton label="Archiver" size="sm" onclick={() => onarchive(true)}
			><Archive size={14} /></IconButton
		>
	{:else}
		<button type="button" class={convert} onclick={() => onarchive(false)}
			><ArchiveRestore size={13} />Désarchiver</button
		>
	{/if}
	<IconButton label="Supprimer" size="sm" class="hover:text-danger" onclick={onremove}
		><Trash2 size={14} /></IconButton
	>
</div>
