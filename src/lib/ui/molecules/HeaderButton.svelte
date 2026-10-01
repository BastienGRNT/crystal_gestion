<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		onclick?: () => void;
		href?: string;
		primary?: boolean;
		title?: string;
		/** Keyboard shortcut shown at the end of the button. */
		shortcut?: string;
		children: Snippet;
	}

	let { onclick, href, primary = false, title, shortcut, children }: Props = $props();
	const tone = $derived(
		primary
			? 'bg-accent text-accent-ink hover:brightness-110'
			: 'border border-line text-ink hover:bg-hover'
	);
</script>

<svelte:element
	this={href ? 'a' : 'button'}
	{href}
	{onclick}
	{title}
	type={href ? undefined : 'button'}
	role={href ? undefined : 'button'}
	class="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-ui font-medium whitespace-nowrap transition {tone}"
>
	{@render children()}
	{#if shortcut}<span class="font-mono text-2xs opacity-70">{shortcut}</span>{/if}
</svelte:element>
