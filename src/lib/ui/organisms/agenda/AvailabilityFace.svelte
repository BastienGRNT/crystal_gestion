<script lang="ts">
	import { clockLabel } from '$lib/modules/planning/domain/calendar';
	import { availabilityFill, rangeLabel, tint } from './geometry';
	import type { AgendaItem } from './types';

	let { item, compact }: { item: AgendaItem; compact: boolean } = $props();
</script>

<div
	class="flex h-full flex-col overflow-hidden rounded-md px-1.5 {compact
		? 'py-0.5'
		: 'py-1'} text-2xs leading-tight text-ink-2"
	style="{tint(item.color)};{availabilityFill(item.maybe)}"
>
	<span class="truncate font-medium text-ink">{item.maybe ? 'Peut-être' : item.label}</span>
	{#if !compact}
		<span class="truncate font-mono text-2xs text-ink-3">{rangeLabel(item, clockLabel)}</span>
	{/if}
</div>
