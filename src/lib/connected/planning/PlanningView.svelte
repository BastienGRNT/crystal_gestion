<script lang="ts">
	import { ChevronLeft, ChevronRight, Copy } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { useApp } from '$lib/client/context';
	import { now } from '$lib/client/now.svelte';
	import { atMinutes, shiftIso, addDays } from '$lib/modules/planning/domain/calendar';
	import {
		DAY_PERIODS,
		periodSlot,
		type DayPeriod
	} from '$lib/modules/planning/domain/availability';
	import type { Project } from '$lib/modules/projects/domain/project';
	import Button from '$lib/ui/atoms/Button.svelte';
	import IconButton from '$lib/ui/atoms/IconButton.svelte';
	import Segmented from '$lib/ui/molecules/Segmented.svelte';
	import AgendaGrid from '$lib/ui/organisms/agenda/AgendaGrid.svelte';
	import type { AgendaItem, AgendaLayer } from '$lib/ui/organisms/agenda/types';
	import PageHeader from '$lib/ui/organisms/PageHeader.svelte';
	import AgendaSelection from './AgendaSelection.svelte';
	import { useAgendaData } from './agenda-data.svelte';
	import { AgendaView } from './agenda-view.svelte';
	import { agendaDays, periodLabel } from './period-label';

	let { project }: { project: Project } = $props();
	const context = useApp();
	// `actions` is also the name of a header snippet below.
	const { actions: act, overlays } = context;
	const view = new AgendaView();
	const data = useAgendaData(
		context,
		() => project,
		() => view
	);
	let selection = $state<{ item: AgendaItem; point: { x: number; y: number } } | null>(null);
	let closedAt = 0;

	onMount(() => {
		view.compact = matchMedia('(max-width: 767px)').matches;
	});

	const close = () => ((selection = null), (closedAt = Date.now()));

	function create(day: number, start: number, end: number, tap: boolean) {
		// A tap that only closed the popover must not also create a slot under it.
		if (tap && Date.now() - closedAt < 600) return;
		const range = {
			startsAt: atMinutes(view.days[day], start).toISOString(),
			endsAt: atMinutes(view.days[day], end).toISOString()
		};
		if (view.layer === 'availability') act.planning.createSlot(range);
		else act.planning.createBlock(project.id, range);
	}

	function change(item: AgendaItem, startShift: number, endShift: number) {
		const target =
			item.layer === 'availability'
				? context.app.slots.get(item.id)
				: context.app.blocks.get(item.id);
		if (!target) return;
		const patch = {
			startsAt: shiftIso(target.startsAt, startShift),
			endsAt: shiftIso(target.endsAt, endShift)
		};
		if (item.layer === 'availability') act.planning.updateSlot(item.id, patch);
		else act.planning.updateBlock(item.id, patch);
	}

	const addToday = (period: DayPeriod) => act.planning.createSlot(periodSlot(new Date(), period));

	function onkeydown(event: KeyboardEvent) {
		const target = event.target as HTMLElement;
		if (target.closest('input, textarea, [contenteditable]') || event.metaKey || event.ctrlKey)
			return;
		if (event.key === 'ArrowLeft') view.step(-1);
		if (event.key === 'ArrowRight') view.step(1);
	}
</script>

<svelte:window {onkeydown} />

<div class="flex h-full flex-col">
	<PageHeader
		title="Planning"
		subtitle="Les dispos de chacun, le travail prévu et les échéances. Glisse sur la grille pour ajouter, tire un bloc pour le déplacer."
	>
		{#snippet actions()}
			<Button
				icon={Copy}
				onclick={() => act.planning.copyWeek(addDays(view.days[0], -7), view.days[0])}
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
		<div class="ml-auto flex flex-wrap items-center gap-2">
			<span class="hidden text-sm text-ink-3 xl:inline">En glissant, j’ajoute :</span>
			<Segmented
				label="Ce que tu ajoutes en glissant"
				size="sm"
				value={view.layer}
				onchange={(layer: AgendaLayer) => view.setLayer(layer)}
				options={[
					{ value: 'availability', label: 'Mes dispos', dot: 'bg-accent' },
					{ value: 'block', label: 'Du travail prévu', dot: 'bg-ink-2' }
				]}
			/>
		</div>
	</div>

	<div class="flex flex-wrap items-center gap-2 px-4 pb-3 sm:px-8">
		<span class="text-sm font-medium text-ink-2">Dispo aujourd’hui :</span>
		{#each Object.entries(DAY_PERIODS) as [key, period] (key)}
			<button
				onclick={() => addToday(key as DayPeriod)}
				class="h-9 rounded-full border border-line px-3.5 text-sm font-medium text-ink-2 transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent-text"
			>
				{period.label} <span class="font-normal opacity-70">{period.from}h–{period.to}h</span>
			</button>
		{/each}
		<span class="text-sm text-ink-3">· ou dessine ton créneau à l’heure près sur la grille.</span>
	</div>

	<div class="min-h-[420px] flex-1 px-4 pb-4 sm:px-8">
		{#key `${view.days[0].getTime()}-${view.days.length}`}
			<AgendaGrid
				days={agendaDays(view.days, now.value, data.marks)}
				onmark={(id) => id && overlays.openTask(id)}
				lanes={data.lanes}
				items={data.items}
				bands={data.bands}
				layer={view.layer}
				myLane={Math.max(
					0,
					data.lanes.findIndex((l) => l.id === context.app.meId)
				)}
				now={data.marker}
				oncreate={create}
				onchange={change}
				onselect={(item, point) => (selection = { item, point })}
				hourHeight={40}
			/>
		{/key}
	</div>

	<div class="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 pb-6 text-sm text-ink-2 sm:px-8">
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
		{#if view.audience === 'team'}
			<span class="flex items-center gap-1.5"
				><span class="inline-block h-3 w-4 rounded-[3px] border-l-2 border-accent bg-accent/10"
				></span>Dispos ensemble</span
			>
		{/if}
		<span class="text-ink-3"
			>Clique sur un créneau pour le changer (dispo, peut-être, supprimer) ou lier un bloc à une
			tâche.</span
		>
	</div>
</div>

{#if selection}<AgendaSelection {selection} projectId={project.id} onclose={close} />{/if}
