<script lang="ts">
	import AddLine from '../../molecules/AddLine.svelte';
	import type { MiniCell } from '../../types';
	import MatrixFrame from './MatrixFrame.svelte';
	import MiniRow from './MiniRow.svelte';

	interface Props {
		cells: MiniCell[];
		onmove: (taskId: string, cellKey: string) => void;
		onopen: (ref: string) => void;
		ontoggle: (taskId: string) => void;
		onadd: (cellKey: string, text: string) => void;
	}

	/** Compact rows in the grid: drag a task from « Planifier » to « Faire maintenant ». */
	let { cells, onmove, onopen, ontoggle, onadd }: Props = $props();
	let dragging = $state<string | null>(null);
	let over = $state<string | null>(null);
	const frame = $derived(cells.map((c) => ({ ...c, count: c.tasks.length })));

	function drop(event: DragEvent, key: string) {
		event.preventDefault();
		if (dragging) onmove(dragging, key);
		[dragging, over] = [null, null];
	}
</script>

<MatrixFrame
	cells={frame}
	{over}
	ondragover={(event, key) => dragging && (event.preventDefault(), (over = key))}
	ondragleave={(key) => over === key && (over = null)}
	ondrop={drop}
>
	{#snippet quadrant(index)}
		{@const cell = cells[index]}
		<div class="flex flex-col gap-1" role="list">
			{#each cell.tasks as task (task.id)}
				<MiniRow
					{task}
					dragging={dragging === task.id}
					ondragstart={() => (dragging = task.id)}
					ondragend={() => ([dragging, over] = [null, null])}
					onopen={() => onopen(task.ref)}
					ontoggle={() => ontoggle(task.id)}
				/>
			{/each}
		</div>
		<div class="mt-auto pt-1">
			<AddLine label="Ajouter" placeholder="Une Task · demain" onadd={(t) => onadd(cell.key, t)} />
		</div>
	{/snippet}
</MatrixFrame>
