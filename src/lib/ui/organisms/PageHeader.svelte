<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		/** One sentence: what this page is for. */
		subtitle?: string;
		leading?: Snippet;
		actions?: Snippet;
		tabs?: Snippet;
		meta?: Snippet;
	}

	let { title, subtitle, leading, actions, tabs, meta }: Props = $props();
</script>

<header class={['border-line px-4 pt-5 sm:px-8 sm:pt-7', tabs ? 'border-b' : 'pb-2']}>
	<div class="mx-auto flex max-w-[1440px] flex-wrap items-start gap-x-4 gap-y-3 pb-4">
		{#if leading}<div class="pt-1">{@render leading()}</div>{/if}
		<div class="min-w-0 flex-1 basis-60">
			<h1 class="truncate text-2xl font-semibold tracking-tight">{title}</h1>
			{#if subtitle}<p class="mt-0.5 text-base text-ink-3">{subtitle}</p>{/if}
			{#if meta}<div class="mt-2 flex flex-wrap items-center gap-2">{@render meta()}</div>{/if}
		</div>
		{#if actions}<div class="flex flex-wrap items-center gap-2">{@render actions()}</div>{/if}
	</div>
	{#if tabs}<div class="mx-auto max-w-[1440px]">{@render tabs()}</div>{/if}
</header>
