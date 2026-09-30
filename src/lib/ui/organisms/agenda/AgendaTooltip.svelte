<script lang="ts">
	import type { AgendaItem } from './types';

	let { item, x, y }: { item: AgendaItem; x: number; y: number } = $props();
	const WIDTH = 272;
	// Beside the pointer, flipped to the left near the right edge so it never leaves the screen.
	const left = $derived(x + 16 + WIDTH > window.innerWidth ? x - 16 - WIDTH : x + 16);
	const top = $derived(Math.min(y + 12, window.innerHeight - 180));
</script>

<div
	class="pointer-events-none fixed z-50 animate-rise rounded-lg border border-line bg-surface p-3 shadow-pop"
	style="left:{left}px;top:{top}px;width:{WIDTH}px"
	role="tooltip"
>
	<p class="flex items-start gap-2 font-semibold">
		{#if item.layer === 'block'}<span
				class="mt-1 size-2.5 shrink-0 rounded-[3px]"
				style="background:{item.color}"
			></span>{/if}
		{item.info.title}
	</p>
	<ul class="mt-1.5 flex flex-col gap-0.5 text-sm text-ink-2">
		{#each item.info.lines as line (line)}<li>{line}</li>{/each}
	</ul>
</div>
