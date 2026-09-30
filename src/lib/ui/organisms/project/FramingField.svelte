<script lang="ts">
	import type { Snippet } from 'svelte';

	let { label, children }: { label: string; children: Snippet } = $props();
</script>

<div class="grid gap-1 border-t border-line py-4 sm:grid-cols-[12rem_1fr] sm:gap-6">
	<p class="pt-1.5 text-[12.5px] font-medium tracking-wide text-ink-3 uppercase">{label}</p>
	<div class="min-w-0 text-[14.5px]">{@render children()}</div>
</div>
