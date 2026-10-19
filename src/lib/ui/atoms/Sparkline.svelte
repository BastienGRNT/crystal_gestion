<script lang="ts">
	interface Props {
		values: number[];
		/** Drawn dashed, when there is one. */
		target?: number | null;
		label: string;
		width?: number;
		height?: number;
	}

	let { values, target = null, label, width = 140, height = 36 }: Props = $props();
	const PAD = 3;

	const scale = $derived.by(() => {
		const all = target === null ? values : [...values, target];
		const min = Math.min(...all);
		const max = Math.max(...all);
		const span = max - min || 1;
		const x = (i: number) => PAD + (i * (width - 2 * PAD)) / Math.max(1, values.length - 1);
		const y = (v: number) => height - PAD - ((v - min) / span) * (height - 2 * PAD);
		return { x, y };
	});
	const points = $derived(values.map((v, i) => `${scale.x(i)},${scale.y(v)}`).join(' '));
</script>

<svg {width} {height} viewBox="0 0 {width} {height}" role="img" aria-label={label} class="shrink-0">
	{#if target !== null && values.length}
		<line
			x1={PAD}
			x2={width - PAD}
			y1={scale.y(target)}
			y2={scale.y(target)}
			stroke="currentColor"
			stroke-dasharray="3 3"
			class="text-ink-4"
		/>
	{/if}
	{#if values.length > 1}
		<polyline
			{points}
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linejoin="round"
			stroke-linecap="round"
		/>
	{/if}
	{#if values.length}
		<circle
			cx={scale.x(values.length - 1)}
			cy={scale.y(values.at(-1)!)}
			r="3"
			fill="currentColor"
		/>
	{/if}
</svg>
