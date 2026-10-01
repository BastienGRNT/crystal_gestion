<script lang="ts">
	import AddLine from '../../molecules/AddLine.svelte';
	import TaskCard from '../../molecules/TaskCard.svelte';
	import type { MatrixCell } from '../../types';
	import MatrixFrame from './MatrixFrame.svelte';

	interface Props {
		/** Row by row: important & urgent, important, urgent, neither. */
		cells: MatrixCell[];
		onmove: (id: string, quadrant: string) => void;
		onopen: (ref: string) => void;
		onadd: (quadrant: string, title: string, isFix: boolean) => void;
	}

	let { cells, onmove, onopen, onadd }: Props = $props();
	let dragging = $state<string | null>(null);
	let over = $state<string | null>(null);
	const frame = $derived(cells.map((c) => ({ ...c, count: c.cards.length })));

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
		<ul class="grid flex-1 content-start gap-2 xl:grid-cols-2">
			{#each cell.cards as card (card.id)}
				<li class="animate-rise">
					<TaskCard
						task={card}
						draggable
						dragging={dragging === card.id}
						onopen={() => onopen(card.ref)}
						ondragstart={(event) => (
							event.dataTransfer?.setData('text/plain', card.id),
							(dragging = card.id)
						)}
						ondragend={() => ([dragging, over] = [null, null])}
					/>
				</li>
			{:else}
				<li class="py-6 text-center text-sm text-ink-3 xl:col-span-2">
					Glisse une tâche ici pour la classer « {cell.label} »
				</li>
			{/each}
		</ul>
		<div class="mt-2">
			<AddLine label="Ajouter une Task" onadd={(title) => onadd(cell.key, title, false)} />
		</div>
	{/snippet}
</MatrixFrame>
