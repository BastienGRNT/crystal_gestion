<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Check } from '@lucide/svelte';

	interface Props {
		index: number;
		title: string;
		hint: string;
		clear: boolean;
		children: Snippet;
	}

	let { index, title, hint, clear, children }: Props = $props();
</script>

<section class="grid grid-cols-[2.5rem_1fr] gap-x-4 border-t border-line py-8 sm:grid-cols-[4rem_1fr]">
	<span class="font-mono text-[13px] {clear ? 'text-success' : 'text-accent'}">
		{#if clear}<Check size={16} strokeWidth={2.5} />{:else}{String(index).padStart(2, '0')}{/if}
	</span>
	<div class="min-w-0">
		<h2 class="font-display text-[30px] leading-none">{title}</h2>
		<p class="mt-1.5 mb-5 text-[13px] text-ink-3">{hint}</p>
		{@render children()}
	</div>
</section>
