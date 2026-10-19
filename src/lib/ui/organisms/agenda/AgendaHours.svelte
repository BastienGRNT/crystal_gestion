<script lang="ts">
	let { from, to, hourHeight }: { from: number; to: number; hourHeight: number } = $props();
	const hours = $derived(
		Array.from({ length: Math.max(0, to - from - 1) }, (_, i) => from + i + 1)
	);
</script>

<div class="relative w-11 shrink-0 select-none" aria-hidden="true">
	{#each hours as hour (hour)}
		<span
			class="absolute right-2 -translate-y-1/2 font-mono text-xs text-ink-3"
			style="top:{(hour - from) * hourHeight}px">{hour}h</span
		>
	{/each}
</div>
