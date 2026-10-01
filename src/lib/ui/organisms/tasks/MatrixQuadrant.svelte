<script lang="ts">
	import QuickAdd from '../../molecules/QuickAdd.svelte';
	import TaskCard from '../../molecules/TaskCard.svelte';
	import type { MatrixCell } from '../../types';

	interface Props {
		cell: MatrixCell;
		draggingId: string | null;
		ondragstart: (id: string) => void;
		ondragend: () => void;
		ondrop: () => void;
		onopen: (ref: string) => void;
		onadd: (title: string, isFix: boolean) => void;
	}

	let { cell, draggingId, ondragstart, ondragend, ondrop, onopen, onadd }: Props = $props();
	let over = $state(false);
</script>

<section
	class="flex min-h-72 min-w-0 flex-col rounded-xl border-2 p-3 transition {over
		? 'border-accent bg-accent-soft/40'
		: 'border-transparent bg-sunken/60'}"
	aria-label={cell.label}
	ondragover={(event) => draggingId && (event.preventDefault(), (over = true))}
	ondragleave={() => (over = false)}
	ondrop={(event) => (event.preventDefault(), (over = false), ondrop())}
>
	<header class="mb-3 flex items-baseline gap-2 px-1">
		<span class="size-2.5 self-center rounded-full {cell.tone}"></span>
		<h2 class="text-lg font-semibold">{cell.label}</h2>
		<span class="text-sm text-ink-3">{cell.hint}</span>
		<span class="ml-auto rounded-full bg-surface px-2 font-mono text-xs text-ink-2"
			>{cell.cards.length}</span
		>
	</header>
	<ul class="grid flex-1 content-start gap-2 xl:grid-cols-2">
		{#each cell.cards as card (card.id)}
			<li class="animate-rise">
				<TaskCard
					task={card}
					draggable
					dragging={draggingId === card.id}
					onopen={() => onopen(card.ref)}
					ondragstart={(event) => (
						event.dataTransfer?.setData('text/plain', card.id),
						ondragstart(card.id)
					)}
					{ondragend}
				/>
			</li>
		{:else}
			<li
				class="flex items-center justify-center rounded-lg border border-dashed border-line-strong/70 px-3 py-6 text-center text-sm text-ink-3 xl:col-span-2"
			>
				Glisse une tâche ici pour la classer « {cell.label} »
			</li>
		{/each}
	</ul>
	<div class="mt-2"><QuickAdd placeholder="Ajouter…" onadd={(title) => onadd(title, false)} /></div>
</section>
