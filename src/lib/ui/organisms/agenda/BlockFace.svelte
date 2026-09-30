<script lang="ts">
	import { clockLabel } from '$lib/modules/planning/domain/calendar';
	import type { AgendaItem } from './types';

	let { item, compact }: { item: AgendaItem; compact: boolean } = $props();
	const personal = $derived(item.color === null);
</script>

<!-- The prism frame is the app signature for live work: only a running timer gets it. -->
<div class="h-full rounded-md {item.running ? 'p-[2px] prism' : ''}">
	<div
		class="flex h-full flex-col overflow-hidden rounded-[5px] px-1.5 {compact
			? 'py-px'
			: 'py-1'} text-[11px] leading-tight shadow-sm {personal ? 'bg-ink text-bg' : 'text-white'}"
		style={personal ? '' : `background:${item.color}`}
	>
		<span class="flex min-w-0 items-baseline gap-1">
			{#if item.running}<span class="size-1.5 shrink-0 animate-pulse rounded-full bg-must"
				></span>{/if}
			{#if item.ref}<span class="shrink-0 font-mono text-[10px] opacity-70">{item.ref}</span>{/if}
			<span class="truncate font-medium">{item.label}</span>
		</span>
		{#if !compact}
			<span class="truncate font-mono text-[10px] opacity-60"
				>{clockLabel(item.start)}–{item.running ? 'en cours' : clockLabel(item.end)}</span
			>
		{/if}
	</div>
</div>
