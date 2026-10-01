<script lang="ts">
	/** Compact progress for lists: a ring that fills up; prism when finished. */
	let {
		ratio,
		size = 14,
		color = 'var(--accent)'
	}: { ratio: number; size?: number; color?: string } = $props();
	const r = 5.5;
	const length = 2 * Math.PI * r;
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 14 14"
	class="shrink-0 -rotate-90"
	role="img"
	aria-label="{Math.round(ratio * 100)} % fait"
>
	<circle cx="7" cy="7" {r} fill="none" stroke="var(--line-strong)" stroke-width="2" />
	{#if ratio > 0}
		<circle
			cx="7"
			cy="7"
			{r}
			fill="none"
			stroke={ratio >= 1 ? 'var(--success)' : color}
			stroke-width="2"
			stroke-linecap="round"
			stroke-dasharray="{length * Math.min(ratio, 1)} {length}"
		/>
	{/if}
</svg>
