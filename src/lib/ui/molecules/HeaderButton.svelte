<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		onclick?: () => void;
		href?: string;
		primary?: boolean;
		title?: string;
		/** Keyboard shortcut, shown on the button so it can be learnt by looking. */
		shortcut?: string;
		children: Snippet;
	}

	let { onclick, href, primary = false, title, shortcut, children }: Props = $props();
	const tone = $derived(
		primary
			? 'bg-primary text-primary-ink border-primary hover:opacity-90'
			: 'border-line-strong bg-surface text-ink hover:border-ink-3'
	);
</script>

<svelte:element
	this={href ? 'a' : 'button'}
	{href}
	{onclick}
	title={shortcut ? `${title ?? ''} (touche ${shortcut})`.trim() : title}
	type={href ? undefined : 'button'}
	role={href ? undefined : 'button'}
	class="inline-flex h-10 items-center gap-2 rounded-[11px] border-[1.5px] px-4 text-sm font-bold whitespace-nowrap transition hover:no-underline {tone}"
>
	{@render children()}
	{#if shortcut}<kbd
			class="ml-0.5 rounded-[5px] px-1.5 font-sans text-2xs font-bold {primary
				? 'bg-white/15'
				: 'bg-sunken text-ink-3'}">{shortcut}</kbd
		>{/if}
</svelte:element>
