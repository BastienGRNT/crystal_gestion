<script lang="ts">
	import { useApp } from '$lib/client/context';
	import PlanningView from '$lib/connected/planning/PlanningView.svelte';
	import { currentProject } from '$lib/connected/projects/current.svelte';

	const { app } = useApp();
	const project = $derived(currentProject(app));
</script>

<svelte:head><title>Planning · {project?.name ?? ''} · Crystal</title></svelte:head>

{#if project}
	{#key project.id}<PlanningView {project} />{/key}
{/if}
