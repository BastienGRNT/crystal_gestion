<script lang="ts">
	import { CircleCheck, CircleHelp } from '@lucide/svelte';
	import Badge from '../atoms/Badge.svelte';

	let { waitingOn }: { waitingOn: string[] } = $props();
</script>

{#if waitingOn.length}
	<Badge tone="should"><CircleHelp size={12} /> Question · attend {waitingOn.join(', ')}</Badge>
{:else}
	<Badge tone="success"><CircleCheck size={12} /> Question traitée</Badge>
{/if}
