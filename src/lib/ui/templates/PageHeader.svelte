<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		/** One sentence under the title: what this page is for, or a date. */
		meta?: string;
		/** Named buttons on the right: « + Task », « + Feat »… */
		actions?: Snippet;
		/** Big tabs under the title (`PageTabs`). */
		tabs?: Snippet;
		/** Left of the title: a feat color, an icon. */
		lead?: Snippet;
		/** Replaces the title text (an editable title). */
		heading?: Snippet;
	}

	let { title, meta, actions, tabs, lead, heading }: Props = $props();
</script>

<header class="shrink-0 px-12 pt-9 max-lg:px-8 max-md:px-5 max-md:pt-6">
	<div class="flex flex-wrap items-end gap-x-6 gap-y-4">
		<div class="min-w-0 flex-1">
			<h1
				class="flex items-center gap-3 text-3xl font-extrabold tracking-[-0.02em] max-md:text-2xl"
			>
				{@render lead?.()}{#if heading}{@render heading()}{:else}{title}{/if}
			</h1>
			{#if meta}<p class="mt-1.5 text-base text-ink-2">{meta}</p>{/if}
		</div>
		{#if actions}<div class="flex flex-wrap items-center gap-2.5">{@render actions()}</div>{/if}
	</div>
	{#if tabs}<div class="mt-6">{@render tabs()}</div>{/if}
</header>
