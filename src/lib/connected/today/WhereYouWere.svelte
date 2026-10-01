<script lang="ts">
	import { Play } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import { lastWorkedTaskId } from '$lib/client/views/catch-up';
	import { TaskSources } from '$lib/client/views/task-sources.svelte';
	import Card from '$lib/ui/molecules/Card.svelte';
	import TaskItem from '../tasks/TaskItem.svelte';

	/** Where I left off: the task I last timed, then what I have in progress. */
	const { store, actions, me, peek } = useProject();
	const sources = new TaskSources(store);
	const last = $derived(store.tasks.get(lastWorkedTaskId(store.timeEntries.items, me.id) ?? ''));
	const inProgress = $derived(
		store.tasks.items.filter(
			(t) =>
				t.id !== last?.id &&
				t.assigneeIds.includes(me.id) &&
				(t.status === 'in_progress' || t.status === 'review')
		)
	);
	const doneLately = $derived(
		store.tasks.items
			.filter((t) => t.status === 'done' && t.assigneeIds.includes(me.id) && t.completedAt)
			.sort((a, b) => b.completedAt!.localeCompare(a.completedAt!))
			.slice(0, 3)
	);
	const resume =
		'relative inline-flex h-7 items-center gap-1.5 rounded-md bg-accent px-2.5 text-xs font-medium text-accent-ink hover:brightness-110';
</script>

<Card title="Où tu en étais">
	<div class="-mx-2">
		{#if last && last.status !== 'done'}
			{@const card = sources.card(last)}
			<TaskItem task={card} withPeople={false}>
				{#snippet extra()}
					{#if !card.running}
						<button type="button" class={resume} onclick={() => actions.tasks.start(last.id)}
							><Play size={12} />Reprendre</button
						>
					{/if}
				{/snippet}
			</TaskItem>
		{/if}
		{#each inProgress as task (task.id)}<TaskItem
				task={sources.card(task)}
				withPeople={false}
			/>{/each}
		{#if !inProgress.length && !(last && last.status !== 'done')}
			<p class="px-2 py-1 text-ui text-ink-3">
				Aucune tâche en cours. Choisis-en une dans ta matrice et lance le chrono.
			</p>
		{/if}
	</div>
	{#if doneLately.length}
		<p class="mt-3 border-t border-line pt-3 text-xs text-ink-3">
			Tu as fini dernièrement :
			{#each doneLately as task, i (task.id)}<button
					type="button"
					class="text-ink-2 hover:text-ink hover:underline"
					onclick={() => peek(task.ref)}>{task.title}</button
				>{i < doneLately.length - 1 ? ', ' : '.'}{/each}
		</p>
	{/if}
</Card>
