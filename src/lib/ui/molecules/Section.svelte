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
	<header class="mb-3 flex min-h-8 items-center gap-2.5">
		<h2 class="text-lg font-extrabold tracking-[-0.01em]">{title}</h2>
		{#if count !== undefined}<span
				class="rounded-full bg-sunken px-2 py-px text-xs font-bold text-ink-2 tabular-nums"
				>{count}</span
			>{/if}
		{#if action}<div class="ml-auto text-ui text-ink-3">{@render action()}</div>{/if}
	</header>
	{@render children()}
</section>
