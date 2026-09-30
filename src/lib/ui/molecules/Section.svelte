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

<section class="mb-10">
	<header class="mb-3 flex items-baseline gap-2.5 border-b border-line pb-2">
		<h2 class="font-display text-[24px] leading-none">{title}</h2>
		{#if count !== undefined}<span class="font-mono text-[11px] text-ink-3">{count}</span>{/if}
		{#if action}<div class="ml-auto text-[12.5px]">{@render action()}</div>{/if}
	</header>
	{@render children()}
</section>
