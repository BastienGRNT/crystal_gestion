<script lang="ts">
	import AddLine from '../../molecules/AddLine.svelte';
	import type { MiniCell } from '../../types';
	import MiniRow from './MiniRow.svelte';

	interface Props {
		cells: MiniCell[];
		onmove: (taskId: string, cellKey: string) => void;
		onopen: (ref: string) => void;
		ontoggle: (taskId: string) => void;
		onadd: (cellKey: string, text: string) => void;
	}

	/** Four drop zones: drag a task from « Planifier » to « Faire maintenant » and it stays there. */
	let { cells, onmove, onopen, ontoggle, onadd }: Props = $props();
	let dragging = $state<string | null>(null);
	let over = $state<string | null>(null);

	function drop(event: DragEvent, key: string) {
		event.preventDefault();
		if (dragging) onmove(dragging, key);
		[dragging, over] = [null, null];
	}
</script>

<div class="grid gap-2.5 sm:grid-cols-2">
	{#each cells as cell (cell.key)}
		<section
			aria-label={cell.label}
			ondragover={(event) => dragging && (event.preventDefault(), (over = cell.key))}
			ondragleave={() => over === cell.key && (over = null)}
			ondrop={(event) => drop(event, cell.key)}
			class="flex min-h-40 flex-col rounded-xl border-2 p-2 transition {over === cell.key
				? 'border-accent bg-accent-soft/50'
				: 'border-transparent bg-sunken'}"
		>
			<header class="flex items-baseline gap-2 px-1.5 pt-1 pb-2">
				<span class="size-2 shrink-0 self-center rounded-full" style="background:{cell.color}"
				></span>
				<h3 class="text-sm font-semibold">{cell.label}</h3>
				<span class="truncate text-xs text-ink-3">{cell.hint}</span>
				<span class="ml-auto text-xs text-ink-3">{cell.tasks.length || ''}</span>
			</header>
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
				<AddLine
					label="Ajouter"
					placeholder="Une tâche pour moi · demain"
					onadd={(t) => onadd(cell.key, t)}
				/>
			</div>
		</section>
	{/each}
</div>
