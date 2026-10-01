<script lang="ts">
	import type { TaskCardView } from '$lib/client/views/task-card';
	import QuickAdd from '../../molecules/QuickAdd.svelte';
	import TaskCard from '../../molecules/TaskCard.svelte';
	import { dropIndex } from './drop-index';

	interface Props {
		label: string;
		tone: string;
		hint?: string;
		cards: TaskCardView[];
		draggingId: string | null;
		ondragstart: (id: string) => void;
		ondragend: () => void;
		ondrop: (index: number) => void;
		onopen: (ref: string) => void;
		onadd: (title: string, isFix: boolean) => void;
	}

	let {
		label,
		tone,
		hint,
		cards,
		draggingId,
		ondragstart,
		ondragend,
		ondrop,
		onopen,
		onadd
	}: Props = $props();
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

<section
	class="flex w-[82vw] shrink-0 snap-start flex-col rounded-xl bg-sunken p-2 sm:w-auto sm:min-w-[220px] sm:flex-1"
	aria-label={label}
>
	<header class="px-1.5 pt-1.5 pb-1.5">
		<div class="flex items-center gap-2">
			<span class="size-2 rounded-full {tone}"></span>
			<h2 class="text-ui font-semibold">{label}</h2>
			<span class="text-xs text-ink-3">{cards.length}</span>
		</div>
		{#if hint}<p class="mt-0.5 text-xs text-ink-3">{hint}</p>{/if}
	</header>
	<div
		bind:this={list}
		class="flex min-h-24 flex-1 flex-col gap-1.5"
		role="list"
		ondragover={over}
		ondragleave={() => (hoverIndex = null)}
		ondrop={drop}
	>
		{#each cards as card, index (card.id)}
			{#if hoverIndex === index}<div class="h-0.5 rounded-full bg-accent"></div>{/if}
			<div data-card role="listitem" class="animate-rise">
				<TaskCard
					task={card}
					withStatus={false}
					draggable
					dragging={draggingId === card.id}
					onopen={() => onopen(card.ref)}
					ondragstart={(event) => (
						event.dataTransfer?.setData('text/plain', card.id),
						ondragstart(card.id)
					)}
					{ondragend}
				/>
			</div>
		{/each}
		{#if hoverIndex === cards.length}<div class="h-0.5 rounded-full bg-accent"></div>{/if}
		<div class="mt-auto pt-1">
			<QuickAdd placeholder="Ajouter…" onadd={(title) => onadd(title, false)} />
		</div>
	</div>
</section>
