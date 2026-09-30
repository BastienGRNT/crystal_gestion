<script lang="ts">
	import { ArrowRight } from '@lucide/svelte';
	import type { ScopeChange } from '$lib/modules/features/domain/scope';
	import PriorityBadge from '../atoms/PriorityBadge.svelte';

	let { change }: { change: ScopeChange } = $props();
</script>

<span class="inline-flex flex-wrap items-center gap-2 text-[12.5px] text-ink-3">
	{#if change.change === 'reprioritized'}
		<PriorityBadge priority={change.from} />
		<ArrowRight size={13} />
		<PriorityBadge priority={change.to} />
	{:else if change.change === 'added'}
		Ajoutée au périmètre en <PriorityBadge priority={change.priority} />
	{:else}
		<span class="line-through"><PriorityBadge priority={change.priority} /></span> Retirée du périmètre
	{/if}
</span>
