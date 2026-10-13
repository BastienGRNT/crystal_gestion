<script lang="ts">
	import { FolderPlus } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { plural } from '$lib/client/format';
	import { tint } from '$lib/client/labels';
	import { activeProjects, projectCounts, teamOf } from '$lib/client/views/workspace';
	import Avatar from '$lib/ui/atoms/Avatar.svelte';
	import Button from '$lib/ui/atoms/Button.svelte';
	import EmptyState from '$lib/ui/molecules/EmptyState.svelte';
	import PageHeader from '$lib/ui/organisms/PageHeader.svelte';

	const { app, overlays } = useApp();
	const projects = $derived(activeProjects(app.projects.all));
	const archived = $derived(app.projects.all.filter((p) => p.archivedAt));
	const create = () => (overlays.create = { kind: 'project' });
</script>

<svelte:head><title>Mes projets · Crystal</title></svelte:head>

<PageHeader
	title="Mes projets"
	subtitle="Chaque projet a son équipe, son tableau, sa discussion, son planning et ses documents."
>
	{#snippet actions()}<Button variant="primary" icon={FolderPlus} onclick={create}
			>Nouveau projet</Button
		>{/snippet}
</PageHeader>

<div class="mx-auto max-w-5xl px-4 pb-12 sm:px-8">
	{#if projects.length}
		<div class="grid gap-4 sm:grid-cols-2">
			{#each projects as project (project.id)}
				{@const counts = projectCounts(app.tasks.all, project.id)}
				{@const team = teamOf(app.members.all, project.id)}
				<a
					href="/p/{project.slug}"
					class="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5 shadow-card transition-all hover:border-line-strong hover:shadow-raise"
				>
					<div class="flex items-center gap-3">
						<span class="size-4 rounded-md" style:background-color={tint(project.color)}></span>
						<h2 class="min-w-0 flex-1 truncate text-lg font-semibold">{project.name}</h2>
						<span class="flex -space-x-1.5">
							{#each team as member (member.id)}
								{@const user = app.users.get(member.userId)}
								{#if user}<Avatar name={user.name} color={user.color} size="sm" />{/if}
							{/each}
						</span>
					</div>
					{#if project.description}<p class="line-clamp-2 text-base text-ink-3">
							{project.description}
						</p>{/if}
					<p class="flex flex-wrap gap-x-4 gap-y-1 text-sm">
						{#if counts.now}<span class="font-semibold text-now-text">{counts.now} maintenant</span
							>{/if}
						<span class="text-ink-2">{counts.doing} en cours</span>
						<span class="text-ink-3">{plural(counts.todo, 'à faire', 'à faire')}</span>
					</p>
				</a>
			{/each}
		</div>
	{:else}
		<EmptyState
			icon={FolderPlus}
			title="Crée ton premier projet"
			text="Un projet regroupe son équipe, ses tâches, sa discussion, son planning, ses documents et ses accès."
		>
			<Button variant="primary" onclick={create}>Créer un projet</Button>
		</EmptyState>
	{/if}

	{#if archived.length}
		<h2 class="mt-10 mb-3 text-md font-semibold text-ink-2">Archivés</h2>
		<ul class="flex flex-col gap-1">
			{#each archived as project (project.id)}
				<li>
					<a
						href="/p/{project.slug}"
						class="flex h-11 items-center gap-3 rounded-xl px-3 text-base text-ink-2 hover:bg-hover"
					>
						<span
							class="size-3 rounded-[4px] opacity-60"
							style:background-color={tint(project.color)}
						></span>{project.name}
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</div>
