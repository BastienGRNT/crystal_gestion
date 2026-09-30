<script lang="ts">
	import type { Snippet } from 'svelte';

	let { label, children }: { label: string; children: Snippet } = $props();
</script>

<div class="grid min-h-9 grid-cols-[7.5rem_1fr] items-center gap-3">
	<span class="text-[12.5px] text-ink-3">{label}</span>
	<div class="min-w-0">{@render children()}</div>
</div>
