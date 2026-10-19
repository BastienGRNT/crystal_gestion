<script lang="ts">
	import AvailabilityFace from './AvailabilityFace.svelte';
	import BlockFace from './BlockFace.svelte';
	import { boxStyle } from './geometry';
	import type { AgendaItem, DragMode, GridFrame } from './types';

	interface Props {
		item: AgendaItem;
		lanes: number;
		frame: GridFrame;
		dragging: boolean;
		onbegin: (event: PointerEvent, mode: DragMode, item: AgendaItem) => void;
	}

	let { item, lanes, frame, dragging, onbegin }: Props = $props();
	const compact = $derived(item.end - item.start < 45);
	const block = $derived(item.layer === 'block');
	const resizable = $derived(item.editable && !item.running);
	const movable = $derived(block && resizable);
	// Availability lies under the work: drawing over it plans something there, a tap opens it.
	const mode = $derived<DragMode>(block ? 'move' : 'create');
	const begin = (mode: DragMode) => (event: PointerEvent) => onbegin(event, mode, item);
</script>

<div
	role="button"
	tabindex="-1"
	aria-label={item.label}
	class="group absolute select-none {block ? 'z-10' : 'z-5'} {movable
		? 'cursor-grab touch-none'
		: block
			? 'cursor-pointer'
			: ''} {dragging ? 'opacity-25' : ''}"
	style={boxStyle(item, lanes, frame)}
	onpointerdown={begin(mode)}
	data-agenda-item={item.id}
>
	{#if block}<BlockFace {item} {compact} />{:else}<AvailabilityFace {item} {compact} />{/if}
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
