<script lang="ts">
	import { ArrowUpRight } from '@lucide/svelte';
	import type { Moscow } from '$lib/modules/features/domain/feature';
	import PriorityBadge from '../atoms/PriorityBadge.svelte';

	interface Props {
		title: string;
		/** Feature threads link back to their feature. */
		feature?: { ref: string; priority: Moscow; href: string };
	}

	let { title, feature }: Props = $props();
</script>

<header class="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
	<div class="min-w-0">
		<p class="mb-1 font-mono text-[11px] tracking-[0.14em] text-ink-3 uppercase">
			Discussion{#if feature}&nbsp;· {feature.ref}{/if}
		</p>
		<h1 class="truncate font-display text-[30px] leading-[1.05] sm:text-[42px]">
			{#if !feature}<span class="text-ink-3 italic">#</span>{/if}{title}
		</h1>
	</div>
	{#if feature}
		<div class="flex items-center gap-2 pb-1">
			<PriorityBadge priority={feature.priority} />
			<a
				href={feature.href}
				class="inline-flex items-center gap-1 text-[13px] text-ink-2 transition hover:text-accent"
				>Voir la feature <ArrowUpRight size={13} /></a
			>
		</div>
	{/if}
</header>
