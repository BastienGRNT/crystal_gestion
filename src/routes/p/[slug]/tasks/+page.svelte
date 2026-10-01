<script lang="ts">
	import { Columns3, Grid2x2, List, Plus, X } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import { overlays } from '$lib/client/overlays.svelte';
	import { featureColors } from '$lib/client/views/feature-colors';
	import type { TaskFilter } from '$lib/client/views/kanban';
	import { isArchived } from '$lib/modules/features/domain/feature';
	import { isActive } from '$lib/modules/tasks/domain/task';
	import Kanban from '$lib/connected/tasks/Kanban.svelte';
	import Matrix from '$lib/connected/tasks/Matrix.svelte';
	import Outline from '$lib/connected/tasks/Outline.svelte';
	import HeaderButton from '$lib/ui/molecules/HeaderButton.svelte';
	import Segmented from '$lib/ui/molecules/Segmented.svelte';
	import TaskFilters from '$lib/ui/organisms/tasks/TaskFilters.svelte';
	import Page from '$lib/ui/templates/Page.svelte';
	import PageHeader from '$lib/ui/templates/PageHeader.svelte';

	type View = 'list' | 'kanban' | 'matrix';
	const { store, actions, me } = useProject();
	const saved = me.preferences.taskView;
	let view = $state<View>(saved === 'kanban' || saved === 'matrix' ? saved : 'list');
	let filter = $state<TaskFilter>({ person: '', feature: '', bugsOnly: false });
	const open = $derived(store.tasks.items.filter(isActive).length);
	const feature = $derived(store.features.items.find((f) => f.id === filter.feature));
	const colorOf = $derived(featureColors(store.features.items));
	const featureOptions = $derived([
		{ value: '', label: 'Toutes les features', active: !filter.feature },
		...store.features.items
			.filter((f) => !isArchived(f) && f.priority !== 'wont')
			.map((f) => ({
				...{ value: f.id, label: f.title, square: colorOf(f.id) },
				active: filter.feature === f.id
			})),
		{ value: 'none', label: 'Sans feature', icon: X, active: filter.feature === 'none' }
	]);

	function choose(next: View) {
		view = next;
		actions.project.setTaskView(next);
	}
</script>

<svelte:head><title>Gestion · {store.project.name}</title></svelte:head>

<PageHeader title="Gestion" meta="{open} tâche{open > 1 ? 's' : ''} ouverte{open > 1 ? 's' : ''}">
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
		<HeaderButton
			primary
			title="Nouveau (C)"
			onclick={() =>
				overlays.openCreate(filter.bugsOnly ? 'bug' : 'task', { featureId: feature?.id ?? null })}
			><Plus size={15} />Nouveau</HeaderButton
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
	<Page width="max-w-[1040px]"><Outline {filter} /></Page>
{:else}
	<div class="px-5 py-4 max-md:px-4">
		{#if view === 'kanban'}<Kanban {filter} />{:else}<Matrix {filter} />{/if}
	</div>
{/if}
