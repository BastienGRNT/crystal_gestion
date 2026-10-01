<script lang="ts">
	import {
		Archive,
		Columns3,
		Grid2x2,
		Layers,
		Lightbulb,
		ListChecks,
		Plus,
		Wrench,
		X
	} from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import { overlays } from '$lib/client/overlays.svelte';
	import { openFeats } from '$lib/client/views/open-feats';
	import type { TaskFilter } from '$lib/client/views/kanban';
	import { isArchived } from '$lib/modules/features/domain/feature';
	import { isOpen } from '$lib/modules/ideas/domain/idea';
	import ArchivesTab from '$lib/connected/tasks/ArchivesTab.svelte';
	import IdeasTab from '$lib/connected/tasks/IdeasTab.svelte';
	import Kanban from '$lib/connected/tasks/Kanban.svelte';
	import Matrix from '$lib/connected/tasks/Matrix.svelte';
	import Outline from '$lib/connected/tasks/Outline.svelte';
	import HeaderButton from '$lib/ui/molecules/HeaderButton.svelte';
	import PageTabs from '$lib/ui/molecules/PageTabs.svelte';
	import TaskFilters from '$lib/ui/organisms/tasks/TaskFilters.svelte';
	import Page from '$lib/ui/templates/Page.svelte';
	import PageHeader from '$lib/ui/templates/PageHeader.svelte';

	type View = 'list' | 'kanban' | 'matrix' | 'ideas' | 'archives';
	const { store, actions, me } = useProject();
	const saved = me.preferences.taskView;
	let view = $state<View>(saved === 'kanban' || saved === 'matrix' ? saved : 'list');
	let filter = $state<TaskFilter>({ person: '', feature: '', bugsOnly: false });
	const feature = $derived(store.features.items.find((f) => f.id === filter.feature));
	const seed = $derived({ featureId: feature?.id ?? null });
	const work = $derived(view === 'list' || view === 'kanban' || view === 'matrix');
	const viewTabs = $derived([
		{ value: 'list' as View, label: 'Liste', icon: ListChecks },
		{ value: 'kanban' as View, label: 'Tableau', icon: Columns3 },
		{ value: 'matrix' as View, label: 'Matrice', icon: Grid2x2 },
		{
			value: 'ideas' as View,
			label: 'Idées',
			icon: Lightbulb,
			count: store.ideas.items.filter(isOpen).length
		},
		{
			value: 'archives' as View,
			label: 'Archives',
			icon: Archive,
			count: store.features.items.filter(isArchived).length
		}
	]);
	const people = $derived([
		{ value: '', label: 'Tout le monde', active: !filter.person },
		...store.members.items.map((m) => ({
			...{ value: m.id, label: m.id === me.id ? 'Moi' : m.name, person: m },
			active: filter.person === m.id
		}))
	]);
	const featOptions = $derived([
		{ value: '', label: 'Toutes les Feats', active: !filter.feature },
		...openFeats(store.features.items).map((f) => ({
			...{ value: f.id, label: f.title, square: f.color },
			active: filter.feature === f.id
		})),
		{ value: 'none', label: 'Sans Feat', icon: X, active: filter.feature === 'none' }
	]);

	function choose(next: View) {
		view = next;
		if (next === 'list' || next === 'kanban' || next === 'matrix')
			actions.project.setTaskView(next);
	}
</script>

<svelte:head><title>Gestion · {store.project.name}</title></svelte:head>

<PageHeader
	title="Gestion"
	meta="Les Feats et leurs Tasks, les Fix, l’Icebox et les idées : tout ce qu’il y a à faire."
>
	{#snippet actions()}
		{#if view === 'ideas'}
			<HeaderButton primary shortcut="I" onclick={() => overlays.openCreate('idea')}
				><Lightbulb size={16} />Nouvelle idée</HeaderButton
			>
		{:else if view !== 'archives'}
			<HeaderButton shortcut="X" onclick={() => overlays.openCreate('fix', seed)}
				><Wrench size={16} class="text-must" />Fix</HeaderButton
			>
			<HeaderButton shortcut="T" onclick={() => overlays.openCreate('task', seed)}
				><Plus size={16} />Task</HeaderButton
			>
			<HeaderButton primary shortcut="F" onclick={() => overlays.openCreate('feature')}
				><Layers size={16} />Nouvelle Feat</HeaderButton
			>
		{/if}
	{/snippet}
	{#snippet tabs()}
		<PageTabs label="Vues de Gestion" value={view} tabs={viewTabs} onchange={choose}>
			{#snippet aside()}
				{#if work}
					<TaskFilters
						person={people}
						personLabel={people.find((p) => p.active)?.label ?? 'Tout le monde'}
						features={featOptions}
						featureLabel={filter.feature === 'none'
							? 'Sans Feat'
							: (feature?.title ?? 'Toutes les Feats')}
						fixOnly={!!filter.bugsOnly}
						onperson={(id) => (filter = { ...filter, person: id })}
						onfeature={(id) => (filter = { ...filter, feature: id })}
						onfix={() => (filter = { ...filter, bugsOnly: !filter.bugsOnly })}
					/>
				{/if}
			{/snippet}
		</PageTabs>
	{/snippet}
</PageHeader>
{#if view === 'list'}<Page width="max-w-[1180px]"><Outline {filter} /></Page>
{:else if view === 'ideas'}<Page width="max-w-[1000px]"><IdeasTab /></Page>
{:else if view === 'archives'}<Page width="max-w-[1180px]"><ArchivesTab /></Page>
{:else}
	<div class="px-12 pt-7 pb-14 max-lg:px-8 max-md:px-5">
		{#if view === 'kanban'}<Kanban {filter} />{:else}<Matrix {filter} />{/if}
	</div>
{/if}
