<script lang="ts">
	import { useProject } from '$lib/client/context';
	import type { TaskCardView } from '$lib/client/views/task-card';
	import { taskMenus } from '$lib/client/views/task-menus';
	import TaskLine from '$lib/ui/organisms/tasks/line/TaskLine.svelte';

	let {
		task,
		compact = false,
		withFeature = true
	}: { task: TaskCardView; compact?: boolean; withFeature?: boolean } = $props();
	const { store, actions, me, peek } = useProject();
	const menus = $derived(taskMenus(task, store.features.items, store.members.items, me.id));
</script>

<TaskLine
	{task}
	{menus}
	{compact}
	{withFeature}
	ontoggle={(done) => (done ? actions.tasks.finish(task.id) : actions.tasks.move(task.id, 'todo'))}
	onopen={() => peek(task.ref)}
	ontimer={() => (task.running ? actions.tasks.stopTimer() : actions.tasks.start(task.id))}
	onstatus={(status) => actions.tasks.move(task.id, status)}
	onchange={(changes) => actions.tasks.update(task.id, changes)}
/>
