<script lang="ts">
	import type { Snippet } from 'svelte';
	import { ChevronRight } from '@lucide/svelte';

	interface Props {
		title: string;
		open: boolean;
		ontoggle: () => void;
		/** Feature color square; omitted for « Sans feature ». */
		color?: string;
		href?: string;
		/** Quiet text after the title: « Indispensable · 2/5 ». */
		meta?: string;
		/** Right side: owner, ring, actions. */
		aside?: Snippet;
	}

	let { title, open, ontoggle, color, href, meta, aside }: Props = $props();
</script>

<div class="group/header flex h-11 items-center gap-2 border-b border-line pr-1">
	<button
		type="button"
		onclick={ontoggle}
		aria-expanded={open}
		aria-label={open ? 'Replier' : 'Déplier'}
		class="flex size-7 items-center justify-center rounded-md text-ink-3 hover:bg-hover hover:text-ink"
	>
		<ChevronRight size={15} class="transition {open ? 'rotate-90' : ''}" />
	</button>
	{#if color}<span class="size-3 shrink-0 rounded-[4px]" style="background:{color}"></span>{/if}
	{#if href}
		<a {href} class="min-w-0 truncate text-sm font-semibold hover:underline">{title}</a>
	{:else}
		<span class="min-w-0 truncate text-sm font-semibold">{title}</span>
	{/if}
	{#if meta}<span class="shrink-0 text-xs whitespace-nowrap text-ink-3">{meta}</span>{/if}
	<span class="flex-1"></span>
	{@render aside?.()}
</div>
