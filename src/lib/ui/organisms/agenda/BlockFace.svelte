<script lang="ts">
	import { clockLabel } from '$lib/modules/planning/domain/calendar';
	import { rangeLabel } from './geometry';
	import type { AgendaItem } from './types';

	let { item, compact }: { item: AgendaItem; compact: boolean } = $props();
	// Tinted fill + solid edge in the feature color: readable in both themes with a single palette.
	const tint = $derived(
		`background:color-mix(in srgb, ${item.color} 22%, var(--surface));border-color:${item.color}`
	);
</script>

<!-- The prism frame is the app signature for live work: only a running timer gets it. -->
<div class="h-full rounded-md {item.running ? 'p-[2px] prism' : ''}">
	<div
		class="flex h-full flex-col overflow-hidden rounded-[5px] border-l-[3px] px-1.5 {compact
			? 'py-px'
			: 'py-1'} text-2xs leading-tight text-ink"
		style={tint}
	>
		<span class="flex min-w-0 items-baseline gap-1">
			{#if item.running}<span class="size-1.5 shrink-0 animate-pulse rounded-full bg-must"
				></span>{/if}
			{#if item.ref}<span class="shrink-0 font-mono text-2xs text-ink-2">{item.ref}</span>{/if}
			<span class="truncate font-semibold">{item.label}</span>
		</span>
		{#if !compact}
			<span class="truncate font-mono text-2xs text-ink-2"
				>{item.running ? `${clockLabel(item.start)}–en cours` : rangeLabel(item, clockLabel)}</span
			>
		{/if}
	</div>
</div>
