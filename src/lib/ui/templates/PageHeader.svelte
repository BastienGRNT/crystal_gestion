<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		/** Short context next to the title: a date, a count. */
		meta?: string;
		actions?: Snippet;
	}

	let { title, meta, actions }: Props = $props();
</script>

<!-- The top bar of the page card: what this is on the left, what you can do on the right. -->
<header
	class="sticky top-0 z-10 flex min-h-14 shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-line bg-panel py-2.5 pr-5 pl-6 max-md:px-4"
>
	<h1 class="text-lg font-semibold tracking-[-0.01em]">{title}</h1>
	{#if meta}<span class="text-sm whitespace-nowrap text-ink-3">{meta}</span>{/if}
	<div class="flex-1"></div>
	{#if actions}<div class="flex flex-wrap items-center gap-2">{@render actions()}</div>{/if}
</header>
