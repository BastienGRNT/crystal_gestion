<script lang="ts">
	import AgendaColumn from './AgendaColumn.svelte';
	import AgendaHeader from './AgendaHeader.svelte';
	import AgendaHours from './AgendaHours.svelte';
	import NowLine from './NowLine.svelte';
	import { AgendaDrag } from './drag.svelte';
	import { pointerAt } from './geometry';
	import type { AgendaGridProps } from './types';

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
	}: AgendaGridProps = $props();
	let surface = $state<HTMLElement>();
	const locate = (event: PointerEvent) => pointerAt(surface!, event, days.length, hourHeight);
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
