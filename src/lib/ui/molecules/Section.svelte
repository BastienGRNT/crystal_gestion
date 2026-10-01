<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		count?: number;
		action?: Snippet;
		children: Snippet;
	}

	let { title, count, action, children }: Props = $props();
</script>

<section class="mb-8 last:mb-0">
	<header class="mb-2 flex min-h-7 items-center gap-2">
		<h2 class="text-sm font-semibold">{title}</h2>
		{#if count !== undefined}<span class="text-xs text-ink-3 tabular-nums">{count}</span>{/if}
		{#if action}<div class="ml-auto text-ui text-ink-3">{@render action()}</div>{/if}
	</header>
	{@render children()}
</section>
