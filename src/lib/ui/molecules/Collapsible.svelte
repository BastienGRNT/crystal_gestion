<script lang="ts">
	import type { Snippet } from 'svelte';
	import { ChevronDown, ChevronRight } from '@lucide/svelte';

	interface Props {
		label: string;
		count: number;
		hint?: string;
		open?: boolean;
		children: Snippet;
	}

	let { label, count, hint, open = $bindable(false), children }: Props = $props();
</script>

<button
	type="button"
	onclick={() => (open = !open)}
	aria-expanded={open}
	class="flex items-center gap-1.5 px-2.5 pt-[18px] pb-1.5 text-ui font-semibold text-ink-2 hover:text-ink"
>
	{#if open}<ChevronDown size={14} />{:else}<ChevronRight size={14} />{/if}
	{label}<span class="font-normal text-ink-3">{count}</span>
	{#if hint}<span class="text-xs font-normal text-ink-3">· {hint}</span>{/if}
</button>
{#if open}{@render children()}{/if}
