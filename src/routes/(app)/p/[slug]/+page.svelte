<script lang="ts">
	import { Bug, ClipboardCopy, Plus, Users, Building2 } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { firstName } from '$lib/client/format';
	import { now } from '$lib/client/now.svelte';
	import { toasts } from '$lib/client/toasts.svelte';
	import { daysSpent } from '$lib/client/views/metrics';
	import { weekReport, type ReportAudience } from '$lib/client/views/report';
	import ActivityFeed from '$lib/connected/home/ActivityFeed.svelte';
	import CatchUp from '$lib/connected/home/CatchUp.svelte';
	import CurrentStep from '$lib/connected/home/CurrentStep.svelte';
	import Deadlines from '$lib/connected/home/Deadlines.svelte';
	import FramingGaps from '$lib/connected/home/FramingGaps.svelte';
	import MyWork from '$lib/connected/home/MyWork.svelte';
	import NextSync from '$lib/connected/home/NextSync.svelte';
	import TeamPanel from '$lib/connected/home/TeamPanel.svelte';
	import WeekGoal from '$lib/connected/home/WeekGoal.svelte';
	import WeekNumbers from '$lib/connected/home/WeekNumbers.svelte';
	import Budget from '$lib/connected/metrics/Budget.svelte';
	import BlockingBugs from '$lib/connected/today/BlockingBugs.svelte';
	import Menu from '$lib/ui/molecules/Menu.svelte';
	import { currentProject } from '$lib/connected/projects/current.svelte';
	import Button from '$lib/ui/atoms/Button.svelte';
	import PageHeader from '$lib/ui/organisms/PageHeader.svelte';

	const { app, overlays } = useApp();
	const project = $derived(currentProject(app));
	const tasks = $derived(app.tasks.all.filter((t) => t.projectId === project?.id));

	/** The week, written for whoever was not there: the client, an associate. */
	async function copyReport(audience: ReportAudience) {
		if (!project) return;
		const nameOf = (id: string | null) => {
			const user = app.users.get(id);
			return user ? firstName(user.name) : null;
		};
		const text = weekReport(
			project,
			app.tasks.all,
			nameOf,
			now.today,
			now.value,
			{
				milestones: app.milestones.all,
				decisions: app.decisions.all,
				metrics: app.metrics.all,
				readings: app.readings.all,
				releases: app.releases.all,
				spentDays: daysSpent(app.blocks.all, project.id, now.value),
				components: app.components.all.filter((c) => c.projectId === project.id),
				stories: app.stories.all,
				stakeholders: app.stakeholders.all
			},
			audience
		);
		await navigator.clipboard.writeText(text).catch(() => {});
		toasts.show(
			audience === 'client'
				? 'Compte rendu client copié (sans le technique) : colle-le dans ton mail.'
				: 'Compte rendu de l’équipe copié.',
			{ tone: 'success' }
		);
	}
</script>

{#if project}
	<PageHeader title={project.name} subtitle={project.description || undefined}>
		{#snippet actions()}
			<Menu
				label="Compte rendu de la semaine"
				items={[
					{ label: 'Pour le client', icon: Building2, run: () => copyReport('client') },
					{ label: 'Pour l’équipe', icon: Users, run: () => copyReport('team') }
				]}
			>
				{#snippet trigger({ props })}<Button icon={ClipboardCopy} {...props}>Compte rendu</Button
					>{/snippet}
			</Menu>
			<Button
				icon={Bug}
				shortcut="B"
				onclick={() => overlays.newTask({ projectId: project.id, kind: 'bug' })}>Bug</Button
			>
			<Button
				variant="primary"
				icon={Plus}
				shortcut="N"
				onclick={() => overlays.newTask({ projectId: project.id })}>Nouvelle tâche</Button
			>
		{/snippet}
	</PageHeader>

	<div class="mx-auto flex max-w-[1240px] flex-col gap-8 px-4 pb-12 sm:px-8">
		<BlockingBugs {tasks} />
		<div class="flex flex-col gap-3">
			{#key project.id}<CurrentStep {project} /><Budget {project} line /><WeekNumbers
					{project}
				/>{/key}
			<WeekGoal {project} />
			{#key project.id}<FramingGaps {project} />{/key}
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
