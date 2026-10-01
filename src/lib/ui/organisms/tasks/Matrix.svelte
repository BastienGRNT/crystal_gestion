<script lang="ts">
	import type { MatrixCell } from '../../types';
	import MatrixQuadrant from './MatrixQuadrant.svelte';

	interface Props {
		/** Row by row: important & urgent, important, urgent, neither. */
		cells: MatrixCell[];
		onmove: (id: string, quadrant: string) => void;
		onopen: (ref: string) => void;
		onadd: (quadrant: string, title: string, isFix: boolean) => void;
	}

	let { cells, onmove, onopen, onadd }: Props = $props();
	let draggingId = $state<string | null>(null);
	const axis = 'font-mono text-2xs font-medium tracking-[0.14em] text-ink-3 uppercase';
</script>

<!-- 1fr rows in an auto-height grid get the size of the tallest: both rows stay equal, the matrix stays square. -->
<div
	class="grid gap-3 md:grid-cols-[1.5rem_minmax(0,1fr)_minmax(0,1fr)] md:grid-rows-[auto_1fr_1fr]"
>
	<span class="hidden md:block"></span>
	<p class="{axis} hidden text-center md:block">Urgent</p>
	<p class="{axis} hidden text-center md:block">Pas urgent</p>
	{#each cells as cell, index (cell.key)}
		{#if index % 2 === 0}
			<p
				class="{axis} hidden items-center justify-center [writing-mode:vertical-rl] md:flex md:rotate-180"
			>
				{index === 0 ? 'Important' : 'Moins important'}
			</p>
		{/if}
		<MatrixQuadrant
			{cell}
			{draggingId}
			ondragstart={(id) => (draggingId = id)}
			ondragend={() => (draggingId = null)}
			ondrop={() => draggingId && onmove(draggingId, cell.key)}
			{onopen}
			onadd={(title, isFix) => onadd(cell.key, title, isFix)}
		/>
	{/each}
</div>
