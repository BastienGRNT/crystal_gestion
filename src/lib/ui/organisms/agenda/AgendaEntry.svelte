<script lang="ts">
	import AvailabilityFace from './AvailabilityFace.svelte';
	import BlockFace from './BlockFace.svelte';
	import { boxStyle } from './geometry';
	import type { AgendaItem, DragMode } from './types';

	interface Props {
		item: AgendaItem;
		lanes: number;
		hourHeight: number;
		active: boolean;
		dragging: boolean;
		onbegin: (event: PointerEvent, mode: DragMode, item: AgendaItem) => void;
	}

	let { item, lanes, hourHeight, active, dragging, onbegin }: Props = $props();
	const compact = $derived(item.end - item.start < 45);
	const draggable = $derived(item.editable && !item.running);
	const resizable = $derived(active && draggable);
	const begin = (mode: DragMode) => (event: PointerEvent) => onbegin(event, mode, item);
</script>

<div
	role="button"
	tabindex="-1"
	aria-label={item.label}
	class="group absolute transition-opacity duration-150 select-none {active
		? `z-10 ${draggable ? 'cursor-grab touch-none' : 'cursor-pointer'}`
		: 'opacity-45'} {dragging ? 'opacity-25' : ''}"
	style={boxStyle(item, lanes, hourHeight)}
	onpointerdown={active ? begin('move') : undefined}
	data-agenda-item={item.id}
>
	{#if item.layer === 'availability'}<AvailabilityFace {item} {compact} />{:else}<BlockFace
			{item}
			{compact}
		/>{/if}
	{#if resizable}
		{#if !item.clippedStart}<span
				class="absolute inset-x-0 -top-1 h-2.5 cursor-ns-resize"
				role="presentation"
				data-handle="start"
				onpointerdown={begin('start')}
			></span>{/if}
		{#if !item.clippedEnd}<span
				class="absolute inset-x-0 -bottom-1 h-2.5 cursor-ns-resize after:absolute after:bottom-1.5 after:left-1/2 after:h-[3px] after:w-5 after:-translate-x-1/2 after:rounded-full after:bg-current after:opacity-0 after:transition group-hover:after:opacity-40"
				role="presentation"
				data-handle="end"
				onpointerdown={begin('end')}
			></span>{/if}
	{/if}
</div>
