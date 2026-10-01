<script lang="ts">
	import type { Snippet } from 'svelte';
	import { ArrowRight } from '@lucide/svelte';

	interface Props {
		title?: string;
		/** Link at the right of the title (« Toutes les Tasks → »). */
		link?: { label: string; href: string };
		/** Off for lists whose rows run edge to edge. */
		padded?: boolean;
		children: Snippet;
	}

	let { title, link, padded = true, children }: Props = $props();
</script>

<section class="overflow-hidden rounded-[18px] border-[1.5px] border-line bg-surface">
	{#if title}
		<header class="flex items-center gap-3 px-5 pt-4 {padded ? 'pb-1' : 'pb-3'}">
			<h2 class="flex-1 text-lg font-extrabold tracking-[-0.01em]">{title}</h2>
			{#if link}<a
					href={link.href}
					class="flex items-center gap-1 text-ui font-semibold text-ink-3 hover:text-ink hover:no-underline"
					>{link.label}<ArrowRight size={14} /></a
				>{/if}
		</header>
	{/if}
	<div class={padded ? 'px-5 pt-2 pb-4' : ''}>{@render children()}</div>
</section>
