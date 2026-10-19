<script lang="ts">
	import AgendaEntry from './AgendaEntry.svelte';
	import DraftBox from './DraftBox.svelte';
	import SharedBands from './SharedBands.svelte';
	import type { AgendaDraft, AgendaItem, DragMode, GridFrame, SharedBand } from './types';

	interface Props {
		items: AgendaItem[];
		bands: SharedBand[];
		lanes: number;
		frame: GridFrame;
		today: boolean;
		draft: AgendaDraft | null;
		draggingId: string | null;
		narrow: boolean;
		onbegin: (event: PointerEvent, mode: DragMode, item?: AgendaItem) => void;
	}

	let { items, bands, lanes, frame, today, draft, draggingId, narrow, onbegin }: Props = $props();
</script>

<div
	class="relative touch-pan-y border-l border-line select-none {today ? 'bg-accent-soft/25' : ''}"
	style="background-image:repeating-linear-gradient(to bottom,var(--line) 0 1px,transparent 1px {frame.hourHeight}px)"
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
	<SharedBands {bands} {frame} />
	{#each items as item (`${item.layer}-${item.id}`)}
		<AgendaEntry {item} {lanes} {frame} dragging={item.id === draggingId} {narrow} {onbegin} />
	{/each}
	{#if draft}<DraftBox {draft} {lanes} {frame} />{/if}
</div>
