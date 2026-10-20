<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		id: string;
		title: string;
		/** One sentence: what this part says, and how to fill it. */
		intro?: string;
		children: Snippet;
		aside?: Snippet;
	}

	let { id, title, intro, children, aside }: Props = $props();
</script>

<section {id} aria-labelledby="{id}-title" class="flex scroll-mt-6 flex-col gap-4">
	<header class="flex flex-wrap items-start gap-x-4 gap-y-2">
		<div class="min-w-0 flex-1 basis-64">
			<h2 id="{id}-title" class="text-lg font-semibold tracking-tight">{title}</h2>
			{#if intro}<p class="text-sm text-ink-3">{intro}</p>{/if}
		</div>
		{#if aside}<div class="flex flex-wrap items-center gap-2">{@render aside()}</div>{/if}
	</header>
	{@render children()}
</section>
