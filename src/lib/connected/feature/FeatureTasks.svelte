<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { byPosition } from '$lib/client/views/kanban';
	import { TaskSources } from '$lib/client/views/task-sources.svelte';
	import { TASK_STATUSES } from '$lib/modules/tasks/domain/task';
	import QuickAdd from '$lib/ui/molecules/QuickAdd.svelte';
	import TaskRow from '$lib/ui/molecules/TaskRow.svelte';

	let { featureId }: { featureId: string } = $props();
	const { store, actions, peek } = useProject();
	const sources = new TaskSources(store);
	const tasks = $derived(
		store.tasks.items
			.filter((task) => task.featureId === featureId)
			.sort((a, b) => TASK_STATUSES.indexOf(a.status) - TASK_STATUSES.indexOf(b.status) || byPosition(a, b))
	);
</script>

<div class="flex flex-col">
	{#each tasks as task (task.id)}
		<TaskRow task={{ ...sources.card(task), feature: null }} ontoggle={(done) => (done ? actions.tasks.finish(task.id) : actions.tasks.move(task.id, 'todo'))} onopen={() => peek(task.ref)} onstart={() => actions.tasks.start(task.id)} />
	{/each}
</div>
<div class="mt-2"><QuickAdd placeholder="Ajouter une tâche à cette feature…" onadd={(title) => actions.tasks.create({ title, featureId })} /></div>
