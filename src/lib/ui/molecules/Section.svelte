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

<section class="mb-10 last:mb-0">
	<header class="mb-3 flex min-h-8 items-center gap-2.5">
		<h2 class="text-lg font-semibold tracking-[-0.01em]">{title}</h2>
		{#if count !== undefined}<span class="rounded-full bg-sunken px-2 font-mono text-xs text-ink-2"
				>{count}</span
			>{/if}
		{#if action}<div class="ml-auto text-sm font-medium">{@render action()}</div>{/if}
	</header>
	{@render children()}
</section>
