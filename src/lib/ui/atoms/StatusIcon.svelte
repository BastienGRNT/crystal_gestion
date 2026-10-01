<script lang="ts">
	import type { TaskStatus } from '$lib/modules/tasks/domain/task';

	/** One glyph per status, read at a glance: dashed (icebox) → empty → half → almost → done. */
	let { status, size = 16 }: { status: TaskStatus; size?: number } = $props();
	const FILL: Record<TaskStatus, number> = {
		icebox: 0,
		todo: 0,
		in_progress: 0.5,
		review: 0.75,
		done: 1
	};
	const COLOR: Record<TaskStatus, string> = {
		icebox: 'var(--ink-3)',
		todo: 'var(--ink-3)',
		in_progress: 'var(--should)',
		review: 'var(--accent)',
		done: 'var(--success)'
	};
	const color = $derived(COLOR[status]);
	const fill = $derived(FILL[status]);
	// A pie slice of the inner disc, drawn clockwise from noon.
	const slice = $derived.by(() => {
		const angle = fill * 2 * Math.PI;
		const x = 8 + 4 * Math.sin(angle);
		const y = 8 - 4 * Math.cos(angle);
		return `M8 8 L8 4 A4 4 0 ${fill > 0.5 ? 1 : 0} 1 ${x.toFixed(2)} ${y.toFixed(2)} Z`;
	});
</script>

<svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true" class="shrink-0">
	{#if status === 'done'}
		<circle cx="8" cy="8" r="7" fill={color} />
		<path
			d="M5 8.2 7.1 10.2 11 6"
			fill="none"
			stroke="var(--panel)"
			stroke-width="1.8"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	{:else}
		<circle
			cx="8"
			cy="8"
			r="6.25"
			fill="none"
			stroke={color}
			stroke-width="1.5"
			stroke-dasharray={status === 'icebox' ? '2.2 2' : undefined}
		/>
		{#if fill > 0}<path d={slice} fill={color} />{/if}
	{/if}
</svg>
