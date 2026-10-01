<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { byPosition } from '$lib/client/views/kanban';
	import { quickTask } from '$lib/client/views/quick-add';
	import { TaskSources } from '$lib/client/views/task-sources.svelte';
	import AddLine from '$lib/ui/molecules/AddLine.svelte';
	import TaskItem from '../tasks/TaskItem.svelte';

	/** The feature broken down: open tasks first, type to add the next one, done ones on demand. */
	let { featureId }: { featureId: string } = $props();
	const { store, actions } = useProject();
	const sources = new TaskSources(store);
	const ORDER = ['in_progress', 'review', 'todo', 'icebox', 'done'] as const;
	let showDone = $state(false);
	const tasks = $derived(
		store.tasks.items
			.filter((task) => task.featureId === featureId)
			.sort((a, b) => ORDER.indexOf(a.status) - ORDER.indexOf(b.status) || byPosition(a, b))
	);
	const done = $derived(tasks.filter((t) => t.status === 'done'));
	const shown = $derived(showDone ? tasks : tasks.filter((t) => t.status !== 'done'));
</script>

<div class="-mx-2">
	{#each shown as task (task.id)}<TaskItem task={sources.card(task)} withFeature={false} />{/each}
	<AddLine
		label="Ajouter une tâche"
		placeholder="Une tâche par ligne · @Ana demain · bug: pour un bug"
		onadd={(text) => {
			const isFix = /^bug\s*:/i.test(text);
			const clean = text.replace(/^bug\s*:\s*/i, '');
			actions.tasks.create(quickTask(store, clean, { featureId, isFix, assigneeIds: [] }));
		}}
	/>
	{#if done.length}
		<button
			type="button"
			onclick={() => (showDone = !showDone)}
			class="ml-2 text-xs text-ink-3 hover:text-ink"
			>{showDone ? 'Masquer' : 'Voir'}
			{done.length > 1 ? `les ${done.length} tâches faites` : 'la tâche faite'}</button
		>
	{/if}
</div>
