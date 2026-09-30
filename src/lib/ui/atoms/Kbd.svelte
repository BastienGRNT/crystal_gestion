<script lang="ts">
	import type { Snippet } from 'svelte';
	let { children }: { children: Snippet } = $props();
</script>

<kbd
	class="inline-flex h-5 min-w-5 items-center justify-center rounded-[4px] border border-line bg-surface px-1 font-mono text-2xs text-ink-3"
>
	{@render children()}
</kbd>
