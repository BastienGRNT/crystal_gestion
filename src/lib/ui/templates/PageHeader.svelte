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

<header class="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
	<div class="min-w-0">
		{#if eyebrow}<p
				class="mb-2.5 font-mono text-2xs font-medium tracking-[0.14em] text-ink-3 uppercase"
			>
				{eyebrow}
			</p>{/if}
		<h1 class="font-display text-4xl sm:text-5xl">{title}</h1>
		{#if subtitle}<p class="mt-3 max-w-2xl text-lg text-ink-2">{subtitle}</p>{/if}
	</div>
	{#if actions}<div class="flex flex-wrap items-center gap-2">{@render actions()}</div>{/if}
</header>
