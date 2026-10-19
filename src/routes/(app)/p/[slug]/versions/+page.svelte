<script lang="ts">
	import { useApp } from '$lib/client/context';
	import { currentProject } from '$lib/connected/projects/current.svelte';
	import ReleaseList from '$lib/connected/releases/ReleaseList.svelte';
	import ShipPanel from '$lib/connected/releases/ShipPanel.svelte';
	import PageHeader from '$lib/ui/organisms/PageHeader.svelte';

	const { app } = useApp();
	const project = $derived(currentProject(app));
</script>

<svelte:head><title>Mises en prod · {project?.name ?? ''} · Crystal</title></svelte:head>

{#if project}
	<PageHeader
		title="Mises en prod"
		subtitle="Ce qui part, ce qui est parti et qui prévenir. Le changelog et la note pour les clients s’écrivent depuis les tâches terminées."
	/>
	<div class="mx-auto flex max-w-[1000px] flex-col gap-10 px-4 pb-12 sm:px-8">
		{#key project.id}
			<ShipPanel {project} />
			<ReleaseList {project} />
		{/key}
	</div>
{/if}
