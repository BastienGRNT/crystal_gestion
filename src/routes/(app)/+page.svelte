<script lang="ts">
	import { FolderPlus, Plus } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { capitalize, firstName, longDate } from '$lib/client/format';
	import { now } from '$lib/client/now.svelte';
	import { myLiveProjects, tasksIn } from '$lib/client/views/today';
	import BlockingBugs from '$lib/connected/today/BlockingBugs.svelte';
	import ForMe from '$lib/connected/today/ForMe.svelte';
	import MyProjects from '$lib/connected/today/MyProjects.svelte';
	import NextUp from '$lib/connected/today/NextUp.svelte';
	import TeamToday from '$lib/connected/today/TeamToday.svelte';
	import WeekDeadlines from '$lib/connected/today/WeekDeadlines.svelte';
	import Button from '$lib/ui/atoms/Button.svelte';
	import EmptyState from '$lib/ui/molecules/EmptyState.svelte';
	import PageHeader from '$lib/ui/organisms/PageHeader.svelte';

	const { app, overlays } = useApp();
	const name = $derived(firstName(app.users.get(app.meId)?.name ?? ''));
	// Everything is already in the snapshot: the day is read, never loaded.
	const projects = $derived(myLiveProjects(app.projects.all, app.members.all, app.meId));
	const tasks = $derived(tasksIn(projects, app.tasks.all));
</script>

<svelte:head><title>Ma journée · Crystal</title></svelte:head>

<PageHeader
	title={name ? `Bonjour ${name}` : 'Ma journée'}
	subtitle="{capitalize(
		longDate(now.today)
	)} : ce qui demande ton attention, tous projets confondus."
>
	{#snippet actions()}
		{#if projects.length}
			<Button variant="primary" icon={Plus} onclick={() => overlays.newTask()}
				>Nouvelle tâche</Button
			>
		{/if}
	{/snippet}
</PageHeader>

<div class="mx-auto flex max-w-[1240px] flex-col gap-8 px-4 pb-12 sm:px-8">
	{#if projects.length}
		<BlockingBugs {tasks} />
		<div class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
			<div class="flex min-w-0 flex-col gap-10">
				<ForMe {projects} {tasks} />
				<NextUp {projects} {tasks} />
				<WeekDeadlines {tasks} />
			</div>
			<div class="flex min-w-0 flex-col gap-10">
				<MyProjects {projects} {tasks} />
				<TeamToday {projects} {tasks} />
			</div>
		</div>
	{:else}
		<EmptyState
			icon={FolderPlus}
			title="Pas encore de projet"
			text="Crée ton premier projet pour y ranger tes tâches, ou ouvre le lien d’invitation qu’on t’a envoyé."
		>
			<Button variant="primary" icon={Plus} onclick={() => (overlays.create = { kind: 'project' })}
				>Nouveau projet</Button
			>
		</EmptyState>
	{/if}
</div>
