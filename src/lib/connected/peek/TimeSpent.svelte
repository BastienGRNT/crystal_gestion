<script lang="ts">
	import { Pause, Play, Plus } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import { formatMinutes, isRunning, totalMinutes } from '$lib/modules/time/domain/time-entry';
	import type { Task } from '$lib/modules/tasks/domain/task';
	import PickMenu from '$lib/ui/molecules/PickMenu.svelte';

	/** Time on the task, the chrono, and a menu to add time that was not timed. */
	let { task }: { task: Task } = $props();
	const { store, actions, me } = useProject();
	const own = $derived(store.timeEntries.items.filter((entry) => entry.taskId === task.id));
	const minutes = $derived(totalMinutes(own, new Date()));
	const running = $derived(own.some((e) => e.userId === me.id && isRunning(e)));
	const QUICK = [15, 30, 60, 120].map((m) => ({
		value: m,
		label: m < 60 ? `${m} min` : `${m / 60} h`,
		active: false
	}));
</script>

<div class="flex items-center gap-1">
	<span class="min-w-12 px-2.5 text-ui">{minutes ? formatMinutes(minutes) : '0 min'}</span>
	{#if task.status !== 'done'}
		<button
			type="button"
			onclick={() => (running ? actions.tasks.stopTimer() : actions.tasks.start(task.id))}
			class="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-ui font-medium transition {running
				? 'bg-accent-soft text-accent-text'
				: 'text-accent-text hover:bg-accent-soft'}"
		>
			{#if running}<Pause size={14} />Arrêter le chrono{:else}<Play size={14} />Démarrer le chrono{/if}
		</button>
	{/if}
	<PickMenu
		title="Ajouter du temps passé"
		options={QUICK}
		onpick={(m) => actions.planning.logTime(task.id, m)}
	>
		{#snippet trigger(toggle)}
			<button
				type="button"
				onclick={toggle}
				title="Ajouter du temps passé sans chrono"
				class="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs text-ink-3 hover:bg-hover hover:text-ink"
				><Plus size={13} />du temps</button
			>
		{/snippet}
	</PickMenu>
</div>
