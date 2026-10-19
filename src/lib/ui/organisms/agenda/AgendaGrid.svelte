<script lang="ts">
	import { snap } from '$lib/modules/planning/domain/calendar';
	import AgendaColumn from './AgendaColumn.svelte';
	import AgendaHeader from './AgendaHeader.svelte';
	import AgendaHours from './AgendaHours.svelte';
	import AgendaTooltip from './AgendaTooltip.svelte';
	import NowLine from './NowLine.svelte';
	import { AgendaDrag } from './drag.svelte';
	import { draftIn } from './drag-preview';
	import { hoverAt, pointerAt, TASK_DRAG_TYPE } from './geometry';
	import type { AgendaGridProps, AgendaItem } from './types';

	let {
		days,
		lanes,
		items,
		bands,
		held = null,
		now,
		myLane,
		hourHeight = 48,
		fromHour = 7,
		toHour = 21,
		onmark,
		ondroptask,
		...handlers
	}: AgendaGridProps = $props();
	let surface = $state<HTMLElement>();
	const frame = $derived({ hourHeight, from: fromHour * 60, to: toHour * 60 });
	const locate = (event: MouseEvent) => pointerAt(surface!, event, days.length, frame);
	const drag = new AgendaDrag(
		locate,
		() => handlers,
		() => days.length
	);
	let hover = $state<{ item: AgendaItem; x: number; y: number } | null>(null);
	const carriesTask = (event: DragEvent) =>
		!!ondroptask && !!event.dataTransfer?.types.includes(TASK_DRAG_TYPE);

	function drop(event: DragEvent) {
		const taskId = event.dataTransfer?.getData(TASK_DRAG_TYPE);
		if (!taskId || !ondroptask) return;
		event.preventDefault();
		const { day, minutes } = locate(event);
		ondroptask(day, snap(minutes), taskId);
	}
</script>

<div
	class="rounded-2xl border border-line bg-surface"
	onpointermove={(event) => (hover = hoverAt(event, items, !!drag.draft))}
	onpointerleave={() => (hover = null)}
	role="presentation"
>
	<AgendaHeader {days} {lanes} {onmark} />
	<div class="relative flex" style="height:{(toHour - fromHour) * hourHeight}px">
		<AgendaHours from={fromHour} to={toHour} {hourHeight} />
		<div
			bind:this={surface}
			class="relative grid flex-1"
			style="grid-template-columns:repeat({days.length},minmax(0,1fr))"
			ondragover={(event) => carriesTask(event) && event.preventDefault()}
			ondrop={drop}
			role="presentation"
		>
			{#each days as day, index (day.key)}
				<AgendaColumn
					items={items.filter((item) => item.day === index)}
					bands={bands.filter((band) => band.day === index)}
					lanes={lanes.length}
					{frame}
					today={day.today}
					draft={draftIn(drag.draft ?? held, index)}
					draggingId={drag.draft?.id ?? null}
					onbegin={(event, mode, item) =>
						drag.begin(
							event,
							mode,
							item?.layer ?? 'availability',
							mode === 'create' || !item ? myLane : item.lane,
							item
						)}
				/>
			{/each}
			{#if now}<NowLine day={now.day} days={days.length} minutes={now.minutes} {frame} />{/if}
		</div>
	</div>
</div>
{#if hover}<AgendaTooltip {...hover} />{/if}
