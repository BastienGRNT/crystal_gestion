<script lang="ts">
	import { useApp } from '$lib/client/context';
	import DocumentsView from '$lib/connected/files/DocumentsView.svelte';
	import { currentProject } from '$lib/connected/projects/current.svelte';

	const { app } = useApp();
	const project = $derived(currentProject(app));
</script>

<svelte:head><title>Documents · {project?.name ?? ''} · Crystal</title></svelte:head>

{#if project}<DocumentsView {project} />{/if}
