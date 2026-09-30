<script lang="ts">
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import Button from '$lib/ui/atoms/Button.svelte';
	import IconButton from '$lib/ui/atoms/IconButton.svelte';
	import BarList from '$lib/ui/organisms/history/BarList.svelte';
	import DoneTaskList from '$lib/ui/organisms/history/DoneTaskList.svelte';
	import WeekBars from '$lib/ui/organisms/history/WeekBars.svelte';
	import { historyData } from './history-data';
	import type { HistoryView } from './history-view.svelte';
	import { setParams } from './url-state';

	let { view }: { view: HistoryView } = $props();
	const { store, peek } = useProject();
	const data = $derived(
		historyData({
			period: view.period,
			offset: view.offset,
			now: new Date(),
			entries: store.timeEntries.items,
			members: store.members.items,
			tasks: store.tasks.items,
			features: store.features.items
		})
	);
	const pickWeek = (index: number) => {
		const offset = view.offset + 7 - index;
		setParams({ semaine: offset ? String(offset) : null });
	};
</script>

<div class="mb-4 flex flex-wrap items-center gap-x-6 gap-y-2">
	<div class="flex items-center gap-0.5">
		<IconButton label="Semaine précédente" onclick={() => view.step(-1)}
			><ChevronLeft size={16} /></IconButton
		>
		<Button size="sm" disabled={view.offset === 0} onclick={() => setParams({ semaine: null })}
			>Cette semaine</Button
		>
		<IconButton label="Semaine suivante" disabled={view.offset === 0} onclick={() => view.step(1)}
			><ChevronRight size={16} /></IconButton
		>
	</div>
	<p class="flex items-baseline gap-2 text-ink-3">
		<span class="font-display text-4xl leading-none text-ink">{data.total}</span> passées sur le projet
	</p>
	<p class="flex items-baseline gap-2 text-ink-3">
		<span class="font-display text-4xl leading-none text-ink">{data.done.length}</span>
		{data.done.length > 1 ? 'tâches terminées' : 'tâche terminée'}
	</p>
</div>
<div class="grid gap-4 md:grid-cols-2">
	<BarList title="Par personne" rows={data.people} empty="Aucun temps enregistré." />
	<BarList title="Par feature" rows={data.features} empty="Aucun temps enregistré." />
	<WeekBars weeks={data.weeks} onpick={pickWeek} />
	<DoneTaskList tasks={data.done} onopen={peek} />
</div>
