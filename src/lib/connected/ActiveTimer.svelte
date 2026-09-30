<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { isRunning } from '$lib/modules/time/domain/time-entry';
	import RunningTimer from '$lib/ui/organisms/RunningTimer.svelte';

	const { store, actions, me, peek } = useProject();
	const entry = $derived(
		store.timeEntries.items.find(
			(e) => e.userId === me.id && isRunning(e) && e.projectId === store.project.id
		)
	);
	const task = $derived(entry?.taskId ? store.tasks.get(entry.taskId) : undefined);
</script>

{#if entry && task}
	<RunningTimer
		taskRef={task.ref}
		taskTitle={task.title}
		startedAt={entry.startedAt}
		onopen={() => peek(task.ref)}
		onpause={() => actions.tasks.pause()}
		onfinish={() => actions.tasks.finish(task.id)}
	/>
{/if}
