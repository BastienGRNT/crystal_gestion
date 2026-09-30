<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		count?: number;
		hint?: string;
		aside?: Snippet;
		children: Snippet;
	}

	let { title, count, hint, aside, children }: Props = $props();
</script>

<section class="mt-12 first:mt-0">
	<header class="mb-2 flex flex-wrap items-end gap-x-3 gap-y-1 border-b border-line pb-2.5">
		<h2 class="text-xl font-semibold">{title}</h2>
		{#if count !== undefined}<span class="font-mono text-xs text-ink-3">{count}</span>{/if}
		{#if hint}<p class="text-sm text-ink-3 max-sm:w-full sm:ml-2">{hint}</p>{/if}
		{#if aside}<div class="ml-auto">{@render aside()}</div>{/if}
	</header>
	{@render children()}
</section>
