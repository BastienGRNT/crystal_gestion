<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		index: number;
		label: string;
		hint?: string;
		children: Snippet;
	}

	let { index, label, hint, children }: Props = $props();
</script>

<div
	class="grid grid-cols-[2.5rem_1fr] gap-x-4 border-t border-line py-5 sm:grid-cols-[3rem_14rem_1fr]"
>
	<span class="pt-2 font-mono text-xs text-accent">{String(index).padStart(2, '0')}</span>
	<div class="pt-1.5 sm:pr-4">
		<p class="font-medium">{label}</p>
		{#if hint}<p class="mt-0.5 text-sm text-ink-3">{hint}</p>{/if}
	</div>
	<div class="col-start-2 mt-3 sm:col-start-3 sm:mt-0">{@render children()}</div>
</div>
