<script lang="ts">
	import { columnAt, pxToMinutes } from '$lib/modules/planning/domain/grid';
	import AgendaColumn from './AgendaColumn.svelte';
	import AgendaHeader from './AgendaHeader.svelte';
	import AgendaHours from './AgendaHours.svelte';
	import NowLine from './NowLine.svelte';
	import { AgendaDrag } from './drag.svelte';
	import type { AgendaDay, AgendaHandlers, AgendaItem, AgendaLane, AgendaLayer } from './types';
	import type { SharedBand } from './types';

	interface Props extends AgendaHandlers {
		days: AgendaDay[];
		lanes: AgendaLane[];
		items: AgendaItem[];
		bands: SharedBand[];
		layer: AgendaLayer;
		now: { day: number; minutes: number } | null;
		myLane: number;
		hourHeight?: number;
	}

	let {
		days,
		lanes,
		items,
		bands,
		layer,
		now,
		myLane,
		hourHeight = 48,
		...handlers
	}: Props = $props();
	let surface = $state<HTMLElement>();
	const locate = (event: PointerEvent) => {
		const rect = surface!.getBoundingClientRect();
		const day = columnAt(event.clientX - rect.left, rect.width, days.length);
		return { day, minutes: pxToMinutes(event.clientY - rect.top, { hourHeight }) };
	};
	const drag = new AgendaDrag(locate, () => handlers);
	const scrollToMorning = (node: HTMLElement) => void (node.scrollTop = 7.5 * hourHeight);
</script>

<div
	class="h-full overflow-y-auto overscroll-contain rounded-xl border border-line bg-surface"
	{@attach scrollToMorning}
>
	<AgendaHeader {days} {lanes} />
	<div class="relative flex" style="height:{24 * hourHeight}px">
		<AgendaHours {hourHeight} />
		<div
			bind:this={surface}
			class="relative grid flex-1"
			style="grid-template-columns:repeat({days.length},minmax(0,1fr))"
		>
			{#each days as day, index (day.key)}
				<AgendaColumn
					items={items.filter((item) => item.day === index)}
					bands={bands.filter((band) => band.day === index)}
					lanes={lanes.length}
					{layer}
					{hourHeight}
					today={day.today}
					draft={drag.draft?.day === index ? drag.draft : null}
					draggingId={drag.draft?.id ?? null}
					onbegin={(event, mode, item) =>
						drag.begin(event, mode, item?.layer ?? layer, item?.lane ?? myLane, item)}
				/>
			{/each}
			{#if now}<NowLine day={now.day} days={days.length} minutes={now.minutes} {hourHeight} />{/if}
		</div>
	</div>
</div>
