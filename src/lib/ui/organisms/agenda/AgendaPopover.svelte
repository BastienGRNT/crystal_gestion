<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		point: { x: number; y: number };
		heading: string;
		detail: string;
		onclose: () => void;
		children?: Snippet;
	}

	let { point, heading, detail, onclose, children }: Props = $props();
	let root = $state<HTMLElement>();
	let height = $state(0);
	const WIDTH = 248;
	const left = $derived(Math.max(8, Math.min(point.x - 24, innerWidth - WIDTH - 8)));
	const top = $derived(
		point.y + 12 + height > innerHeight - 8 ? Math.max(8, point.y - height - 12) : point.y + 12
	);
	const outside = (event: PointerEvent) =>
		root && !root.contains(event.target as Node) && onclose();
</script>

<svelte:window onpointerdown={outside} onkeydown={(e) => e.key === 'Escape' && onclose()} />

<div
	bind:this={root}
	bind:clientHeight={height}
	class="fixed z-50 animate-rise rounded-lg border border-line bg-surface p-1 shadow-pop"
	style="left:{left}px;top:{top}px;width:{WIDTH}px"
	role="dialog"
	aria-label={heading}
>
	<div class="px-2.5 pt-1.5 pb-2">
		<p class="truncate text-[13px] font-medium">{heading}</p>
		<p class="font-mono text-[11px] text-ink-3">{detail}</p>
	</div>
	{#if children}<div class="border-t border-line pt-1">{@render children()}</div>{/if}
</div>
