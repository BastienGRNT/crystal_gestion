<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useProject } from '$lib/client/context';
	import type { TaskCardView } from '$lib/client/views/task-card';
	import { taskMenus } from '$lib/client/views/task-menus';
	import TaskLine from '$lib/ui/organisms/tasks/line/TaskLine.svelte';

	interface Props {
		task: TaskCardView;
		withPeople?: boolean;
		withFeature?: boolean;
		/** An action shown on hover, before the metadata (« À faire », « Reprendre »…). */
		extra?: Snippet;
	}

	let { task, withPeople = true, withFeature = true, extra }: Props = $props();
	const { store, actions, me, peek } = useProject();
	const menus = $derived(taskMenus(task, store.features.items, store.members.items, me.id));
</script>

<TaskLine
	{task}
	{menus}
	{withPeople}
	{withFeature}
	{extra}
	ontoggle={(done) => (done ? actions.tasks.finish(task.id) : actions.tasks.move(task.id, 'todo'))}
	onopen={() => peek(task.ref)}
	ontimer={() => (task.running ? actions.tasks.stopTimer() : actions.tasks.start(task.id))}
	onchange={(changes) => actions.tasks.update(task.id, changes)}
/>
