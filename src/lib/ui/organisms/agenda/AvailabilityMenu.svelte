<script lang="ts">
	import { Check, CircleDashed, Trash2 } from '@lucide/svelte';
	import MenuItem from '$lib/ui/molecules/MenuItem.svelte';

	interface Props {
		maybe: boolean;
		onstatus: (maybe: boolean) => void;
		onremove: () => void;
	}

	let { maybe, onstatus, onremove }: Props = $props();
</script>

<MenuItem active={!maybe} onclick={() => onstatus(false)}>
	<Check size={14} class={maybe ? 'opacity-0' : 'text-accent'} /> Dispo
</MenuItem>
<MenuItem active={maybe} onclick={() => onstatus(true)}>
	<CircleDashed size={14} class={maybe ? 'text-accent' : 'opacity-40'} /> Peut-être
</MenuItem>
<MenuItem tone="danger" onclick={onremove}><Trash2 size={14} /> Supprimer</MenuItem>
