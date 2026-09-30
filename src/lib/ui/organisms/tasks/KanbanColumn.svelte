<script lang="ts">
	import type { TaskCardView } from '$lib/client/views/task-card';
	import QuickAdd from '../../molecules/QuickAdd.svelte';
	import TaskCard from '../../molecules/TaskCard.svelte';
	import { dropIndex } from './drop-index';

	interface Props {
		label: string;
		tone: string;
		cards: TaskCardView[];
		draggingId: string | null;
		ondragstart: (id: string) => void;
		ondragend: () => void;
		ondrop: (index: number) => void;
		onopen: (ref: string) => void;
		onadd: (title: string) => void;
	}

	let { label, tone, cards, draggingId, ondragstart, ondragend, ondrop, onopen, onadd }: Props = $props();
	let list: HTMLElement;
	let hoverIndex = $state<number | null>(null);

	function over(event: DragEvent) {
		if (!draggingId) return;
		event.preventDefault();
		hoverIndex = dropIndex(list, event.clientY);
	}

	function drop(event: DragEvent) {
		event.preventDefault();
		if (hoverIndex !== null) ondrop(hoverIndex);
		hoverIndex = null;
	}
</script>

<section class="flex w-[82vw] shrink-0 snap-start flex-col rounded-xl bg-sunken/55 p-2 sm:w-auto sm:min-w-0 sm:flex-1" aria-label={label}>
	<header class="flex items-center gap-2 px-1.5 pt-1 pb-2.5">
		<span class="size-2 rounded-full {tone}"></span>
		<h2 class="text-[13px] font-semibold">{label}</h2>
		<span class="font-mono text-[11px] text-ink-3">{cards.length}</span>
	</header>
	<div bind:this={list} class="flex min-h-24 flex-1 flex-col gap-2" role="list" ondragover={over} ondragleave={() => (hoverIndex = null)} ondrop={drop}>
		{#each cards as card, index (card.id)}
			{#if hoverIndex === index}<div class="h-0.5 rounded-full bg-accent"></div>{/if}
			<div data-card role="listitem" class="animate-rise">
				<TaskCard task={card} draggable dragging={draggingId === card.id} onopen={() => onopen(card.ref)} ondragstart={(event) => (event.dataTransfer?.setData('text/plain', card.id), ondragstart(card.id))} {ondragend} />
			</div>
		{/each}
		{#if hoverIndex === cards.length}<div class="h-0.5 rounded-full bg-accent"></div>{/if}
		<div class="mt-auto pt-1"><QuickAdd placeholder="Ajouter" {onadd} /></div>
	</div>
</section>
