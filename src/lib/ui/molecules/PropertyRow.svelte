<script lang="ts">
	import type { Snippet } from 'svelte';

	let { label, children }: { label: string; children: Snippet } = $props();
</script>

<div class="grid min-h-10 grid-cols-[6.5rem_1fr] items-center gap-3 sm:grid-cols-[7.5rem_1fr]">
	<span class="text-sm text-ink-2">{label}</span>
	<div class="min-w-0">{@render children()}</div>
</div>
