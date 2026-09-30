<script lang="ts">
	let { hourHeight }: { hourHeight: number } = $props();
</script>

<div class="relative w-11 shrink-0 select-none" aria-hidden="true">
	{#each Array.from({ length: 23 }, (_, i) => i + 1) as hour (hour)}
		<span
			class="absolute right-2 -translate-y-1/2 font-mono text-2xs text-ink-3"
			style="top:{hour * hourHeight}px">{hour}h</span
		>
	{/each}
</div>
