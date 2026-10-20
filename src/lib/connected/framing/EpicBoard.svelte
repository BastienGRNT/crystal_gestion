<script lang="ts">
	import { useApp } from '$lib/client/context';
	import type { Project } from '$lib/modules/projects/domain/project';
	import InlineAdd from '$lib/ui/molecules/InlineAdd.svelte';
	import EpicCard from './EpicCard.svelte';
	import StoryRow from './StoryRow.svelte';

	let { project }: { project: Project } = $props();
	const { app, actions } = useApp();

	const epics = $derived(
		app.epics.all.filter((e) => e.projectId === project.id).sort((a, b) => a.position - b.position)
	);
	const initiatives = $derived(
		app.initiatives.all
			.filter((i) => i.projectId === project.id)
			.sort((a, b) => a.position - b.position)
	);
	const groups = $derived([
		...initiatives.map((i) => ({
			key: i.id,
			title: i.title,
			epics: epics.filter((e) => e.initiativeId === i.id && !e.later)
		})),
		{
			key: 'none',
			title: initiatives.length ? 'Sans initiative' : '',
			epics: epics.filter((e) => !e.initiativeId && !e.later)
		}
	]);
	const later = $derived(epics.filter((e) => e.later));
	const orphans = $derived(
		app.stories.all
			.filter((s) => s.projectId === project.id && !s.epicId)
			.sort((a, b) => a.number - b.number)
	);
</script>

<div class="flex flex-col gap-6">
	{#each groups as group (group.key)}
		{#if group.epics.length || group.key === 'none'}
			<div class="flex flex-col gap-3">
				{#if group.title}
					<h3 class="text-sm font-semibold text-accent-text">
						{group.key === 'none' ? group.title : `Initiative · ${group.title}`}
					</h3>
				{/if}
				{#each group.epics as epic (epic.id)}<EpicCard {epic} />{/each}
			</div>
		{/if}
	{/each}
	<InlineAdd
		label="Ajouter une epic"
		placeholder="Un grand ensemble de fonctionnalités, ex. : Réservation patient"
		onadd={(title) => actions.framing.addEpic(project.id, title) !== null}
	/>

	{#if orphans.length}
		<div class="flex flex-col gap-1">
			<h3 class="text-sm font-semibold text-ink-2">Stories sans epic</h3>
			<ul class="flex flex-col rounded-2xl border border-line bg-surface px-3 py-1 shadow-card">
				{#each orphans as story (story.id)}<StoryRow {story} />{/each}
			</ul>
		</div>
	{/if}

	{#if later.length}
		<details class="flex flex-col gap-3">
			<summary class="cursor-pointer text-sm font-semibold text-ink-2"
				>Plus tard ({later.length})</summary
			>
			<div class="mt-3 flex flex-col gap-3">
				{#each later as epic (epic.id)}<EpicCard {epic} />{/each}
			</div>
		</details>
	{/if}
</div>
