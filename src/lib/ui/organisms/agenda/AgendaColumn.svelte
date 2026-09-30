<script lang="ts">
	import AgendaEntry from './AgendaEntry.svelte';
	import DraftBox from './DraftBox.svelte';
	import SharedBands from './SharedBands.svelte';
	import type { AgendaDraft, AgendaItem, AgendaLayer, DragMode, SharedBand } from './types';

	interface Props {
		items: AgendaItem[];
		bands: SharedBand[];
		lanes: number;
		layer: AgendaLayer;
		hourHeight: number;
		today: boolean;
		draft: AgendaDraft | null;
		draggingId: string | null;
		onbegin: (event: PointerEvent, mode: DragMode, item?: AgendaItem) => void;
	}

	let { items, bands, lanes, layer, hourHeight, today, draft, draggingId, onbegin }: Props =
		$props();
</script>

<div
	class="relative touch-pan-y border-l select-none border-line {today ? 'bg-accent-soft/25' : ''}"
	style="background-image:repeating-linear-gradient(to bottom,var(--line) 0 1px,transparent 1px {hourHeight}px)"
	onpointerdown={(event) => onbegin(event, 'create')}
	role="presentation"
	data-agenda-day
>
	{#each Array.from({ length: lanes - 1 }, (_, i) => i + 1) as lane (lane)}
		<span
			class="pointer-events-none absolute inset-y-0 border-l border-dashed border-line/70"
			style="left:{(lane / lanes) * 100}%"
		></span>
	{/each}
	<SharedBands {bands} {hourHeight} />
	{#each items as item (`${item.layer}-${item.id}`)}
		<AgendaEntry
			{item}
			{lanes}
			{hourHeight}
			active={item.layer === layer}
			dragging={item.id === draggingId}
			{onbegin}
		/>
	{/each}
	{#if draft}<DraftBox {draft} {lanes} {hourHeight} />{/if}
</div>
