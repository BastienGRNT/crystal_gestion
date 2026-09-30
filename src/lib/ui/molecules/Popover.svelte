<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		open: boolean;
		align?: 'start' | 'end';
		side?: 'bottom' | 'top';
		width?: string;
		trigger: Snippet;
		children: Snippet;
		onclose: () => void;
	}

	let {
		open,
		align = 'start',
		side = 'bottom',
		width = 'w-64',
		trigger,
		children,
		onclose
	}: Props = $props();
	let root: HTMLElement;

	function handleWindowClick(event: MouseEvent) {
		if (open && !root.contains(event.target as Node)) onclose();
	}
</script>

<svelte:window
	onclick={handleWindowClick}
	onkeydown={(e) => open && e.key === 'Escape' && onclose()}
/>

<div class="relative" bind:this={root}>
	{@render trigger()}
	{#if open}
		<div
			class="absolute z-40 animate-rise rounded-lg border border-line bg-surface p-1 shadow-pop {width} {align ===
			'end'
				? 'right-0'
				: 'left-0'} {side === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'}"
		>
			{@render children()}
		</div>
	{/if}
</div>
