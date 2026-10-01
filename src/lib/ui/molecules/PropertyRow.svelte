<script lang="ts">
	import type { Snippet } from 'svelte';

	let { label, children }: { label: string; children: Snippet } = $props();
</script>

<div class="grid min-h-10 grid-cols-[96px_1fr] items-center gap-3">
	<span class="text-ui text-ink-3">{label}</span>
	<div class="min-w-0">{@render children()}</div>
</div>
