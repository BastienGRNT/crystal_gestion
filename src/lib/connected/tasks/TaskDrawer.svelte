<script lang="ts">
	import { useApp } from '$lib/client/context';
	import Drawer from '$lib/ui/molecules/Drawer.svelte';
	import TaskDetails from './TaskDetails.svelte';

	const { app, overlays } = useApp();
	const task = $derived(app.tasks.get(overlays.taskId));
</script>

<Drawer open={!!task} label="Tâche" onclose={() => overlays.closeTask()}>
	{#if task}
		{#key task.id}<TaskDetails {task} onclose={() => overlays.closeTask()} />{/key}
	{/if}
</Drawer>
