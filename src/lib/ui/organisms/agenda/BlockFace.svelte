<script lang="ts">
	import { clockLabel } from '$lib/modules/planning/domain/calendar';
	import { rangeLabel } from './geometry';
	import type { AgendaItem } from './types';

	let { item, compact }: { item: AgendaItem; compact: boolean } = $props();
	// Tinted fill + solid edge in the person's color: readable in both themes with a single palette.
	// Another project's work is hatched grey: the time is taken, but it is not this project's.
	const fill = $derived(
		item.muted
			? 'background:repeating-linear-gradient(135deg,var(--sunken) 0 6px,var(--surface-2) 6px 12px);border-color:var(--ink-4)'
			: `background:color-mix(in srgb, ${item.color} 22%, var(--surface));border-color:${item.color}`
	);
</script>

<div class="h-full rounded-md">
	<div
		class="flex h-full flex-col overflow-hidden rounded-[5px] border-l-[3px] px-1.5 {compact
			? 'py-px'
			: 'py-1'} text-xs leading-tight {item.muted ? 'text-ink-2' : 'text-ink'}"
		style={fill}
	>
		<span class="flex min-w-0 items-baseline gap-1">
			{#if item.running}<span class="size-1.5 shrink-0 animate-pulse rounded-full bg-now"
				></span>{/if}
			{#if item.ref}<span class="shrink-0 font-mono text-xs text-ink-2">{item.ref}</span>{/if}
			<span class="truncate {item.muted ? 'font-medium' : 'font-semibold'}">{item.label}</span>
		</span>
		{#if !compact}
			<span class="truncate font-mono text-xs text-ink-2"
				>{item.running ? `${clockLabel(item.start)}–en cours` : rangeLabel(item, clockLabel)}</span
			>
		{/if}
	</div>
</div>
