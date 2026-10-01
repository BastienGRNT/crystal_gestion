<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { quickTask } from '$lib/client/views/quick-add';
	import { TaskSources } from '$lib/client/views/task-sources.svelte';
	import { addDays, toDateKey } from '$lib/modules/kernel/domain/dates';
	import { isActive } from '$lib/modules/tasks/domain/task';
	import AddLine from '$lib/ui/molecules/AddLine.svelte';
	import TaskItem from '../tasks/TaskItem.svelte';

	/** Pick tomorrow's tasks: one click sets the due date, so they show up first on Accueil. */
	const { store, actions, me } = useProject();
	const sources = new TaskSources(store);
	const tomorrow = toDateKey(addDays(new Date(), 1));
	const mine = $derived(
		store.tasks.items
			.filter((t) => isActive(t) && t.assigneeIds.includes(me.id))
			.sort((a, b) => (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999'))
	);
	const planned = $derived(mine.filter((t) => t.dueDate === tomorrow).length);
	const pick =
		'relative inline-flex h-7 items-center rounded-md px-2 text-xs font-medium transition';
</script>

<p class="mb-3 text-ui text-ink-3">
	{planned
		? `${planned} Task${planned > 1 ? 's' : ''} prévue${planned > 1 ? 's' : ''} pour demain.`
		: 'Choisis une à trois Tasks pour demain.'}
</p>
<div class="-mx-2">
	{#each mine as task (task.id)}
		{@const chosen = task.dueDate === tomorrow}
		<TaskItem task={sources.card(task)} withPeople={false}>
			{#snippet extra()}
				<button
					type="button"
					class="{pick} {chosen
						? 'bg-accent-soft text-accent-text'
						: 'text-ink-2 opacity-60 group-hover:opacity-100 hover:bg-sunken'}"
					onclick={() => actions.tasks.update(task.id, { dueDate: chosen ? null : tomorrow })}
					>{chosen ? '✓ Demain' : 'Pour demain'}</button
				>
			{/snippet}
		</TaskItem>
	{/each}
	<AddLine
		label="Ajouter une Task pour demain"
		onadd={(text) =>
			actions.tasks.create(quickTask(store, text, { assigneeIds: [me.id], dueDate: tomorrow }))}
	/>
</div>
