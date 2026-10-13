<script lang="ts">
	import { Plus } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import ActivityFeed from '$lib/connected/home/ActivityFeed.svelte';
	import CatchUp from '$lib/connected/home/CatchUp.svelte';
	import Deadlines from '$lib/connected/home/Deadlines.svelte';
	import MyWork from '$lib/connected/home/MyWork.svelte';
	import TeamPanel from '$lib/connected/home/TeamPanel.svelte';
	import WeekGoal from '$lib/connected/home/WeekGoal.svelte';
	import { currentProject } from '$lib/connected/projects/current.svelte';
	import Button from '$lib/ui/atoms/Button.svelte';
	import PageHeader from '$lib/ui/organisms/PageHeader.svelte';

	const { app, overlays } = useApp();
	const project = $derived(currentProject(app));
</script>

{#if project}
	<PageHeader title={project.name} subtitle={project.description || undefined}>
		{#snippet actions()}
			<Button
				variant="primary"
				icon={Plus}
				shortcut="N"
				onclick={() => overlays.newTask({ projectId: project.id })}>Nouvelle tâche</Button
			>
		{/snippet}
	</PageHeader>

	<div class="mx-auto flex max-w-[1240px] flex-col gap-8 px-4 pb-12 sm:px-8">
		<WeekGoal {project} />
		<CatchUp {project} />
		<div class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
			<div class="flex flex-col gap-10">
				<MyWork {project} />
				<Deadlines {project} />
			</div>
			<div class="flex flex-col gap-10">
				<TeamPanel {project} />
				<ActivityFeed {project} />
			</div>
		</div>
	</div>
{/if}
