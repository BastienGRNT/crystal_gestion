<script lang="ts">
	import { Trash2 } from '@lucide/svelte';
	import IconButton from '../atoms/IconButton.svelte';

	let { onconfirm, label = 'Supprimer' }: { onconfirm: () => void; label?: string } = $props();
	let armed = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	// Two clicks instead of a modal: fast, yet a stray click never destroys a password or a file.
	function arm() {
		armed = true;
		clearTimeout(timer);
		timer = setTimeout(() => (armed = false), 3000);
	}
</script>

{#if armed}
	<button
		type="button"
		onclick={() => (clearTimeout(timer), (armed = false), onconfirm())}
		class="inline-flex h-6 shrink-0 animate-rise items-center gap-1 rounded-md bg-danger/12 px-2 text-[12px] font-medium text-danger transition hover:bg-danger/20"
	>
		<Trash2 size={12} />Confirmer
	</button>
{:else}
	<IconButton size="sm" {label} onclick={arm}><Trash2 size={13} /></IconButton>
{/if}
