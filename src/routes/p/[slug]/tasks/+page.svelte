<script lang="ts">
	import { Columns3, Grid2x2, List, X } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import { overlays } from '$lib/client/overlays.svelte';
	import type { TaskFilter } from '$lib/client/views/kanban';
	import { isActive } from '$lib/modules/tasks/domain/task';
	import Kanban from '$lib/connected/tasks/Kanban.svelte';
	import Matrix from '$lib/connected/tasks/Matrix.svelte';
	import TaskList from '$lib/connected/tasks/TaskList.svelte';
	import HeaderButton from '$lib/ui/molecules/HeaderButton.svelte';
	import Segmented from '$lib/ui/molecules/Segmented.svelte';
	import TaskFilters from '$lib/ui/organisms/tasks/TaskFilters.svelte';
	import BugMark from '$lib/ui/atoms/BugMark.svelte';
	import Page from '$lib/ui/templates/Page.svelte';
	import PageHeader from '$lib/ui/templates/PageHeader.svelte';
	import { PRIORITY_COLORS } from '$lib/ui/tones';

	type View = 'list' | 'kanban' | 'matrix';
	const { store, actions, me } = useProject();
	const saved = me.preferences.taskView;
	let view = $state<View>(saved === 'kanban' || saved === 'matrix' ? saved : 'list');
	let filter = $state<TaskFilter>({ person: '', feature: '', bugsOnly: false });
	const open = $derived(store.tasks.items.filter(isActive).length);
	const feature = $derived(store.features.items.find((f) => f.id === filter.feature));
	const featureOptions = $derived([
		{ value: '', label: 'Toutes les features', active: !filter.feature },
		...store.features.items.map((f) => ({
			...{ value: f.id, label: f.title, dot: PRIORITY_COLORS[f.priority] },
			active: filter.feature === f.id
		})),
		{ value: 'none', label: 'Sans feature', icon: X, active: filter.feature === 'none' }
	]);
	const seed = $derived({ featureId: feature?.id ?? null });

	function choose(next: View) {
		view = next;
		actions.project.setTaskView(next);
	}
</script>

<svelte:head><title>Tâches · {store.project.name}</title></svelte:head>

<PageHeader title="Tâches" meta="{open} ouverte{open > 1 ? 's' : ''}">
	{#snippet actions()}
		<Segmented
			label="Vue"
			value={view}
			options={[
				{ value: 'list', label: 'Liste', icon: List },
				{ value: 'kanban', label: 'Tableau', icon: Columns3 },
				{ value: 'matrix', label: 'Matrice', icon: Grid2x2 }
			]}
			onchange={choose}
		/>
		<span class="mx-0.5 h-5 w-px bg-line max-sm:hidden"></span>
		<HeaderButton
			title="Signaler un bug (B)"
			shortcut="B"
			onclick={() => overlays.openCreate('bug', seed)}><BugMark />Bug</HeaderButton
		>
		<HeaderButton
			primary
			title="Nouvelle tâche (C)"
			shortcut="C"
			onclick={() => overlays.openCreate('task', seed)}>+ Tâche</HeaderButton
		>
	{/snippet}
</PageHeader>
<TaskFilters
	mine={filter.person === me.id}
	featureLabel={filter.feature === 'none' ? 'Sans feature' : (feature?.title ?? null)}
	features={featureOptions}
	bugsOnly={!!filter.bugsOnly}
	onmine={(mine) => (filter = { ...filter, person: mine ? me.id : '' })}
	onfeature={(id) => (filter = { ...filter, feature: id })}
	onbugs={() => (filter = { ...filter, bugsOnly: !filter.bugsOnly })}
/>
{#if view === 'list'}
	<Page><TaskList {filter} /></Page>
{:else}
	<div class="px-5 py-4 max-md:px-4">
		{#if view === 'kanban'}<Kanban {filter} />{:else}<Matrix {filter} />{/if}
	</div>
{/if}
