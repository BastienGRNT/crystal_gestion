<script lang="ts">
	import { Plus } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { currentProject } from '$lib/connected/projects/current.svelte';
	import BoardView from '$lib/connected/tasks/BoardView.svelte';
	import Button from '$lib/ui/atoms/Button.svelte';
	import PageHeader from '$lib/ui/organisms/PageHeader.svelte';

	const { app, overlays } = useApp();
	const project = $derived(currentProject(app));
</script>

<svelte:head><title>Tableau · {project?.name ?? ''} · Crystal</title></svelte:head>

{#if project}
	<!-- Full height: the columns scroll, not the page. -->
	<div class="flex h-full flex-col">
		<PageHeader
			title="Tableau"
			subtitle="On finit avant de commencer : deux tâches en cours par personne au plus."
		>
			{#snippet actions()}
				<Button
					variant="primary"
					icon={Plus}
					shortcut="N"
					onclick={() => overlays.newTask({ projectId: project.id })}>Nouvelle tâche</Button
				>
			{/snippet}
		</PageHeader>
		<BoardView {project} />
	</div>
{/if}
