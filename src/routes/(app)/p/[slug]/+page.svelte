<script lang="ts">
	import { ClipboardCopy, Plus } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { firstName } from '$lib/client/format';
	import { now } from '$lib/client/now.svelte';
	import { toasts } from '$lib/client/toasts.svelte';
	import { weekReport } from '$lib/client/views/report';
	import ActivityFeed from '$lib/connected/home/ActivityFeed.svelte';
	import CatchUp from '$lib/connected/home/CatchUp.svelte';
	import CurrentStep from '$lib/connected/home/CurrentStep.svelte';
	import Deadlines from '$lib/connected/home/Deadlines.svelte';
	import MyWork from '$lib/connected/home/MyWork.svelte';
	import NextSync from '$lib/connected/home/NextSync.svelte';
	import TeamPanel from '$lib/connected/home/TeamPanel.svelte';
	import WeekGoal from '$lib/connected/home/WeekGoal.svelte';
	import { currentProject } from '$lib/connected/projects/current.svelte';
	import Button from '$lib/ui/atoms/Button.svelte';
	import PageHeader from '$lib/ui/organisms/PageHeader.svelte';

	const { app, overlays } = useApp();
	const project = $derived(currentProject(app));

	/** The week, written for whoever was not there: the client, an associate. */
	async function copyReport() {
		if (!project) return;
		const nameOf = (id: string | null) => {
			const user = app.users.get(id);
			return user ? firstName(user.name) : null;
		};
		const text = weekReport(project, app.tasks.all, nameOf, now.today, now.value, {
			milestones: app.milestones.all,
			decisions: app.decisions.all,
			readings: app.readings.all
		});
		await navigator.clipboard.writeText(text).catch(() => {});
		toasts.show('Compte rendu de la semaine copié : colle-le dans ton mail ou ton message.', {
			tone: 'success'
		});
	}
</script>

{#if project}
	<PageHeader title={project.name} subtitle={project.description || undefined}>
		{#snippet actions()}
			<Button icon={ClipboardCopy} onclick={copyReport}>Compte rendu</Button>
			<Button
				variant="primary"
				icon={Plus}
				shortcut="N"
				onclick={() => overlays.newTask({ projectId: project.id })}>Nouvelle tâche</Button
			>
		{/snippet}
	</PageHeader>

	<div class="mx-auto flex max-w-[1240px] flex-col gap-8 px-4 pb-12 sm:px-8">
		<div class="flex flex-col gap-3">
			{#key project.id}<CurrentStep {project} />{/key}
			<WeekGoal {project} />
		</div>
		<CatchUp {project} />
		<div class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
			<div class="flex flex-col gap-10">
				<MyWork {project} />
				<Deadlines {project} />
			</div>
			<div class="flex flex-col gap-10">
				<NextSync {project} />
				<TeamPanel {project} />
				<ActivityFeed {project} />
			</div>
		</div>
	</div>
{/if}
