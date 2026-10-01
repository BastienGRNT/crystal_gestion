<script lang="ts">
	import { Plus } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import { formatMinutes, totalMinutes } from '$lib/modules/time/domain/time-entry';
	import type { Task } from '$lib/modules/tasks/domain/task';
	import PickMenu from '$lib/ui/molecules/PickMenu.svelte';

	/** Time on the task, and a way to add time that was not timed. */
	let { task }: { task: Task } = $props();
	const { store, actions } = useProject();
	const own = $derived(store.timeEntries.items.filter((entry) => entry.taskId === task.id));
	const minutes = $derived(totalMinutes(own, new Date()));
	const QUICK = [15, 30, 60, 120].map((m) => ({
		value: m,
		label: m < 60 ? `${m} min` : `${m / 60} h`,
		active: false
	}));
</script>

<div class="flex items-center gap-3">
	<span class="text-lg font-extrabold">{minutes ? formatMinutes(minutes) : '0 min'}</span>
	<PickMenu
		title="Ajouter du temps passé"
		options={QUICK}
		onpick={(m) => actions.planning.logTime(task.id, m)}
	>
		{#snippet trigger(toggle)}
			<button
				type="button"
				onclick={toggle}
				class="inline-flex h-9 items-center gap-1.5 rounded-[10px] border-[1.5px] border-line-strong px-3 text-ui font-semibold text-ink-2 hover:border-ink-3"
				><Plus size={15} />Ajouter du temps sans chrono</button
			>
		{/snippet}
	</PickMenu>
</div>
