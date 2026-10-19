<script lang="ts">
	import { ChevronLeft, ChevronRight, Copy } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { useApp } from '$lib/client/context';
	import { now } from '$lib/client/now.svelte';
	import { hasSlots } from '$lib/client/views/week-plan';
	import { addDays, atMinutes, dayKey, shiftIso } from '$lib/modules/planning/domain/calendar';
	import type { Project } from '$lib/modules/projects/domain/project';
	import Button from '$lib/ui/atoms/Button.svelte';
	import IconButton from '$lib/ui/atoms/IconButton.svelte';
	import Segmented from '$lib/ui/molecules/Segmented.svelte';
	import AgendaGrid from '$lib/ui/organisms/agenda/AgendaGrid.svelte';
	import type { AgendaDraft, AgendaItem, DayMark, Point } from '$lib/ui/organisms/agenda/types';
	import PageHeader from '$lib/ui/organisms/PageHeader.svelte';
	import { roadmapHref } from '../roadmap/roadmap-of';
	import AgendaSelection from './AgendaSelection.svelte';
	import DraftChoice from './DraftChoice.svelte';
	import WeekPanel from './WeekPanel.svelte';
	import WeekStart from './WeekStart.svelte';
	import { useAgendaData } from './agenda-data.svelte';
	import { AgendaView } from './agenda-view.svelte';
	import { agendaDays, periodLabel } from './period-label';
	import { usePlacing } from './placing.svelte';

	let { project }: { project: Project } = $props();
	const context = useApp();
	// `actions` is also the name of a header snippet below.
	const { app, actions: act, overlays } = context;
	const view = new AgendaView();
	const data = useAgendaData(
		context,
		() => project,
		() => view
	);
	const placing = usePlacing(
		context,
		() => project,
		() => view
	);
	let selection = $state<{ item: AgendaItem; point: Point } | null>(null);
	/** A range just drawn, waiting for "dispo", "peut-être" or a task. */
	let held = $state<(AgendaDraft & { point: Point }) | null>(null);
	let closedAt = 0;
	/** Weeks where I chose to draw my availability myself rather than use the shortcuts. */
	let drawing = $state<string[]>([]);

	onMount(() => {
		view.compact = matchMedia('(max-width: 767px)').matches;
	});

	const monday = $derived(view.week[0]);
	const week = $derived({ from: monday, to: addDays(monday, 7) });
	const empty = $derived(
		!hasSlots(app.meId, app.slots.all, week) && !drawing.includes(dayKey(monday))
	);
	const myLane = $derived(
		Math.max(
			0,
			data.lanes.findIndex((l) => l.id === app.meId)
		)
	);
	const heldRange = $derived(
		held && {
			startsAt: atMinutes(view.days[held.day], held.start).toISOString(),
			endsAt: atMinutes(view.days[held.day], held.end).toISOString()
		}
	);

	const close = () => ((selection = null), (held = null), (closedAt = Date.now()));

	function create(day: number, start: number, end: number, point: Point) {
		// A tap that only closed a popover must not open another one under it.
		if (Date.now() - closedAt < 600) return;
		held = { id: null, layer: 'availability', lane: myLane, day, start, end, point };
	}

	function change(item: AgendaItem, startShift: number, endShift: number) {
		const target = item.layer === 'availability' ? app.slots.get(item.id) : app.blocks.get(item.id);
		if (!target) return;
		const patch = {
			startsAt: shiftIso(target.startsAt, startShift),
			endsAt: shiftIso(target.endsAt, endShift)
		};
		if (item.layer === 'availability') act.planning.updateSlot(item.id, patch);
		else act.planning.updateBlock(item.id, patch);
	}

	function openMark(mark: DayMark) {
		if (mark.kind === 'due' || mark.kind === 'done') overlays.openTask(mark.ref);
		else if (mark.ref) goto(roadmapHref(project.slug));
	}

	function onkeydown(event: KeyboardEvent) {
		const target = event.target as HTMLElement;
		if (target.closest('input, textarea, [contenteditable]') || event.metaKey || event.ctrlKey)
			return;
		if (event.key === 'ArrowLeft') view.step(-1);
		if (event.key === 'ArrowRight') view.step(1);
	}
</script>

<svelte:window {onkeydown} />

<PageHeader
	title="Planning"
	subtitle="Qui a combien de temps cette semaine, et quoi poser où : glisse sur la grille pour dire tes dispos ou réserver du temps à une tâche."
>
	{#snippet actions()}
		<Button icon={Copy} onclick={() => act.planning.copyWeek(addDays(monday, -7), monday)}
			>Copier la semaine d’avant</Button
		>
	{/snippet}
</PageHeader>

<div class="flex flex-wrap items-center gap-2.5 px-4 pb-3 sm:px-8">
	<div class="flex items-center gap-1">
		<IconButton icon={ChevronLeft} label="Précédent (←)" onclick={() => view.step(-1)} />
		<Button size="sm" onclick={view.today}>Aujourd’hui</Button>
		<IconButton icon={ChevronRight} label="Suivant (→)" onclick={() => view.step(1)} />
	</div>
	<p class="min-w-40 text-md font-semibold capitalize">{periodLabel(view.days)}</p>
	<Segmented
		label="Échelle"
		size="sm"
		value={view.scale}
		onchange={view.setScale}
		options={[
			{ value: 'week', label: 'Semaine' },
			{ value: 'day', label: 'Jour' }
		]}
	/>
	<Segmented
		label="Personnes"
		size="sm"
		value={view.audience}
		onchange={view.setAudience}
		options={[
			{ value: 'team', label: 'Équipe' },
			{ value: 'me', label: 'Moi' }
		]}
	/>
</div>

{#if empty}
	<div class="px-4 pb-3 sm:px-8">
		<WeekStart {monday} ondraw={() => (drawing = [...drawing, dayKey(monday)])} />
	</div>
{/if}

<div class="flex flex-col gap-4 px-4 pb-4 sm:px-8 lg:flex-row lg:items-start">
	<div class="min-w-0 flex-1">
		{#key `${view.days[0].getTime()}-${view.days.length}`}
			<AgendaGrid
				days={agendaDays(view.days, now.value, data.marks)}
				onmark={openMark}
				lanes={data.lanes}
				items={data.items}
				bands={data.bands}
				{held}
				{myLane}
				now={data.marker}
				oncreate={create}
				onchange={change}
				onselect={(item, point) => (selection = { item, point })}
				ondroptask={placing.dropAt}
				hourHeight={view.compact ? 40 : 48}
				fromHour={data.hours.from}
				toHour={data.hours.to}
			/>
		{/key}

		<div class="flex flex-wrap items-center gap-x-5 gap-y-2 pt-3 text-sm text-ink-2">
			<span class="flex items-center gap-1.5"
				><span class="inline-block h-3 w-4 rounded-[3px] border-l-2 border-accent bg-accent-soft"
				></span>Dispo</span
			>
			<span class="flex items-center gap-1.5"
				><span class="inline-block h-3 w-4 rounded-[3px] border border-dashed border-accent/60"
				></span>Peut-être</span
			>
			<span class="flex items-center gap-1.5"
				><span class="inline-block h-3 w-4 rounded-[3px] border-l-[3px] border-ink-2 bg-ink-2/20"
				></span>Travail prévu</span
			>
			<span class="flex items-center gap-1.5"
				><span class="inline-block h-3 w-4 rounded-[3px] border-l-[3px] border-ink-4 bg-sunken"
				></span>Pris sur un autre projet</span
			>
			{#if view.audience === 'team'}
				<span class="flex items-center gap-1.5"
					><span class="inline-block h-3 w-4 rounded-[3px] border-l-2 border-accent bg-accent/10"
					></span>Dispos ensemble</span
				>
			{/if}
			<span class="text-ink-3"
				>Glisse ou clique sur la grille pour ajouter, tire un bloc pour le déplacer, clique dessus
				pour le changer.</span
			>
		</div>
	</div>

	<WeekPanel {project} days={view.week} {placing} />
</div>

{#if held && heldRange}
	<DraftChoice
		range={heldRange}
		point={held.point}
		projectId={project.id}
		suggestions={placing.toPlace}
		onclose={close}
	/>
{/if}
{#if selection}<AgendaSelection
		{selection}
		projectId={project.id}
		suggestions={placing.toPlace}
		onplace={placing.placeIn}
		onclose={close}
	/>{/if}
