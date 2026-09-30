<script lang="ts">
	import { useProject } from '$lib/client/context';
	import AgendaGrid from '$lib/ui/organisms/agenda/AgendaGrid.svelte';
	import AgendaLegend from '$lib/ui/organisms/agenda/AgendaLegend.svelte';
	import AgendaToolbar from '$lib/ui/organisms/agenda/AgendaToolbar.svelte';
	import type { AgendaItem } from '$lib/ui/organisms/agenda/types';
	import AgendaSelection from './AgendaSelection.svelte';
	import { agendaCommands } from './agenda-commands';
	import type { AgendaView } from './agenda-view.svelte';
	import { agendaDays } from './period-label';
	import { useAgendaData } from './agenda-data.svelte';
	import { agendaShortcuts } from './agenda-shortcuts';

	let { view }: { view: AgendaView } = $props();
	const { store, actions } = useProject();
	const data = useAgendaData(() => view);
	const commands = agendaCommands(store, actions.planning);
	let selection = $state<{ item: AgendaItem; point: { x: number; y: number } } | null>(null);
	let closedAt = 0;
	const onkeydown = agendaShortcuts(() => view);
	const close = () => ((selection = null), (closedAt = Date.now()));
	// A tap that only dismissed the popover must not also create a slot underneath it.
	const oncreate = (day: number, start: number, end: number, tap: boolean) =>
		!(tap && Date.now() - closedAt < 600) &&
		commands.create(view.days[day], start, end, view.layer);
</script>

<svelte:window {onkeydown} />

<AgendaToolbar
	scale={view.scale}
	audience={view.audience}
	layer={view.layer}
	onscale={view.setScale}
	onaudience={view.setAudience}
	onlayer={view.setLayer}
	onstep={view.step}
	ontoday={view.today}
/>
<div class="h-[calc(100dvh-16rem)] min-h-[420px] md:h-[calc(100dvh-19rem)]">
	<AgendaGrid
		days={agendaDays(view.days, data.now)}
		lanes={data.lanes}
		items={data.items}
		bands={data.bands}
		layer={view.layer}
		myLane={0}
		now={data.marker}
		{oncreate}
		onchange={commands.change}
		onselect={(item, point) => (selection = { item, point })}
	/>
</div>
<AgendaLegend people={data.people} team={view.audience === 'team'} />
{#if selection}<AgendaSelection {selection} onclose={close} />{/if}
