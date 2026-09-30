<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		eyebrow?: string;
		title: string;
		subtitle?: string;
		actions?: Snippet;
	}

	let { eyebrow, title, subtitle, actions }: Props = $props();
</script>

<header class="mb-8 flex flex-wrap items-end justify-between gap-4">
	<div class="min-w-0">
		{#if eyebrow}<p class="mb-2 font-mono text-[11px] tracking-[0.14em] text-ink-3 uppercase">
				{eyebrow}
			</p>{/if}
		<h1 class="font-display text-[44px] leading-[0.95] sm:text-[52px]">{title}</h1>
		{#if subtitle}<p class="mt-2 max-w-xl text-ink-2">{subtitle}</p>{/if}
	</div>
	{#if actions}<div class="flex items-center gap-2">{@render actions()}</div>{/if}
</header>
