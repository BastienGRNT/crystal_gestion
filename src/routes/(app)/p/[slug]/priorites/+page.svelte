<script lang="ts">
	import { Plus } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { currentProject } from '$lib/connected/projects/current.svelte';
	import MatrixView from '$lib/connected/tasks/MatrixView.svelte';
	import KindFilter from '$lib/connected/tasks/KindFilter.svelte';
	import PersonFilter from '$lib/connected/tasks/PersonFilter.svelte';
	import StepFilter from '$lib/connected/tasks/StepFilter.svelte';
	import Button from '$lib/ui/atoms/Button.svelte';
	import PageHeader from '$lib/ui/organisms/PageHeader.svelte';

	const { app, overlays } = useApp();
	const project = $derived(currentProject(app));
</script>

<svelte:head><title>Priorités · {project?.name ?? ''} · Crystal</title></svelte:head>

{#if project}
	<PageHeader
		title="Priorités"
		subtitle="Que faire maintenant ? Range chaque tâche selon son urgence et son importance : le tableau suit cet ordre."
	>
		{#snippet actions()}
			<KindFilter projectId={project.id} />
			<StepFilter projectId={project.id} />
			<PersonFilter projectId={project.id} />
			<Button
				variant="primary"
				icon={Plus}
				shortcut="N"
				onclick={() => overlays.newTask({ projectId: project.id })}>Nouvelle tâche</Button
			>
		{/snippet}
	</PageHeader>
	<div class="mx-auto max-w-[1440px] px-4 pb-12 sm:px-8"><MatrixView {project} /></div>
{/if}
