<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { TaskSources } from '$lib/client/views/task-sources.svelte';
	import { toDateKey } from '$lib/modules/kernel/domain/dates';
	import { durationMinutes, formatMinutes } from '$lib/modules/time/domain/time-entry';
	import TaskItem from '../tasks/TaskItem.svelte';

	/** What I finished today and how long I worked: the satisfying part comes first. */
	const { store, me } = useProject();
	const sources = new TaskSources(store);
	const today = toDateKey(new Date());
	const isToday = (iso: string | null) => !!iso && toDateKey(new Date(iso)) === today;
	const done = $derived(
		store.tasks.items.filter((t) => t.assigneeIds.includes(me.id) && isToday(t.completedAt))
	);
	const minutes = $derived(
		store.timeEntries.items
			.filter((e) => e.userId === me.id && isToday(e.startedAt))
			.reduce((sum, e) => sum + durationMinutes(e, new Date()), 0)
	);
	const ongoing = $derived(
		store.tasks.items.filter((t) => t.assigneeIds.includes(me.id) && t.status === 'in_progress')
	);
</script>

<p class="text-base text-ink-2">
	{#if minutes}Tu as travaillé <strong class="text-ink">{formatMinutes(minutes)}</strong> aujourd’hui{:else}Pas
		de temps chronométré aujourd’hui{/if}{done.length
		? ` et fini ${done.length} tâche${done.length > 1 ? 's' : ''}.`
		: '.'}
</p>
{#if done.length}
	<div class="-mx-2 mt-3">
		{#each done as task (task.id)}<TaskItem task={sources.card(task)} withPeople={false} />{/each}
	</div>
{/if}
{#if ongoing.length}
	<h3 class="mt-6 mb-1 text-sm font-semibold">Toujours en cours</h3>
	<p class="mb-2 text-ui text-ink-3">Coche ce qui est en fait terminé.</p>
	<div class="-mx-2">
		{#each ongoing as task (task.id)}<TaskItem
				task={sources.card(task)}
				withPeople={false}
			/>{/each}
	</div>
{/if}
