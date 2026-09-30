<script lang="ts">
	import { Trash2 } from '@lucide/svelte';
	import IconButton from './IconButton.svelte';

	/** One click: deletions are undoable from the toast, so no confirmation step is needed. */
	let { onconfirm, label = 'Supprimer' }: { onconfirm: () => void; label?: string } = $props();
</script>

<IconButton size="sm" {label} onclick={onconfirm} class="hover:text-danger"
	><Trash2 size={14} /></IconButton
>
