<script lang="ts">
	import type { Snippet } from 'svelte';
	import { ArrowRight } from '@lucide/svelte';

	interface Props {
		title?: string;
		/** Link at the right of the title (« Toutes les tâches → »). */
		link?: { label: string; href: string };
		padded?: boolean;
		children: Snippet;
	}

	let { title, link, padded = true, children }: Props = $props();
</script>

<section class="rounded-xl border border-line bg-surface {padded ? 'px-4 py-3.5' : ''}">
	{#if title}
		<header class="mb-2 flex items-center gap-2.5 {padded ? '' : 'px-4 pt-3.5'}">
			<h2 class="flex-1 text-sm font-semibold">{title}</h2>
			{#if link}<a
					href={link.href}
					class="flex items-center gap-1 text-ui text-ink-3 hover:text-ink hover:no-underline"
					>{link.label}<ArrowRight size={13} /></a
				>{/if}
		</header>
	{/if}
	{@render children()}
</section>
