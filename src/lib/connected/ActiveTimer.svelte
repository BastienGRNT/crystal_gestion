<script lang="ts">
	import { goto } from '$app/navigation';
	import { useProject } from '$lib/client/context';
	import RunningTimer from '$lib/ui/organisms/RunningTimer.svelte';

	const { store, actions, peek } = useProject();
	const timer = $derived(store.timer);
	const here = $derived(timer?.entry.projectId === store.project.id);
	const task = $derived(
		here && timer?.entry.taskId ? store.tasks.get(timer.entry.taskId) : undefined
	);
	const open = (ref: string, slug: string) => (here ? peek(ref) : goto(`/p/${slug}?peek=${ref}`));
</script>

{#if timer}
	<RunningTimer
		taskRef={timer.task.ref}
		taskTitle={task?.title ?? timer.task.title}
		startedAt={timer.entry.startedAt}
		projectName={here ? null : timer.project.name}
		onopen={() => open(timer.task.ref, timer.project.slug)}
		onstop={() => actions.tasks.stopTimer()}
		onfinish={task ? () => actions.tasks.finish(task.id) : undefined}
	/>
{/if}
