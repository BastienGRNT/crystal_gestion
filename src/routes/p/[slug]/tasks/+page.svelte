<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { navItem } from '$lib/client/navigation';
	import type { TaskFilter } from '$lib/client/views/kanban';
	import Kanban from '$lib/connected/tasks/Kanban.svelte';
	import Matrix from '$lib/connected/tasks/Matrix.svelte';
	import Segmented from '$lib/ui/molecules/Segmented.svelte';
	import TaskFilters from '$lib/ui/organisms/tasks/TaskFilters.svelte';
	import Page from '$lib/ui/templates/Page.svelte';
	import PageHeader from '$lib/ui/templates/PageHeader.svelte';

	const { store, actions, me } = useProject();
	let view = $state<'kanban' | 'matrix'>(
		me.preferences.taskView === 'kanban' ? 'kanban' : 'matrix'
	);
	let filter = $state<TaskFilter>({ person: '', feature: '' });
	const open = $derived(store.tasks.items.filter((task) => task.status !== 'done').length);
	const subtitle = $derived(
		view === 'matrix'
			? 'Commence en haut à gauche. Urgent = échéance dans 3 jours ou moins ; important = feature Indispensable ou Si possible. Glisse une tâche pour la changer de case.'
			: 'Par statut : glisse une carte quand elle avance.'
	);

	function choose(next: 'kanban' | 'matrix') {
		view = next;
		actions.project.setTaskView(next);
	}
</script>

<svelte:head><title>Tâches · {store.project.name}</title></svelte:head>

<Page>
	<PageHeader
		eyebrow="{open} tâche{open > 1 ? 's' : ''} ouverte{open > 1 ? 's' : ''}"
		title={navItem('tasks').label}
		{subtitle}
	>
		{#snippet actions()}
			<Segmented
				label="Vue"
				value={view}
				options={[
					{ value: 'matrix', label: 'Par urgence' },
					{ value: 'kanban', label: 'Par statut' }
				]}
				onchange={choose}
			/>
			<TaskFilters
				person={filter.person}
				feature={filter.feature}
				people={store.members.items.map((m) => ({
					value: m.id,
					label: m.id === me.id ? `${m.name} (moi)` : m.name
				}))}
				features={store.features.items.map((f) => ({ value: f.id, label: f.title }))}
				onchange={(next) => (filter = next)}
			/>
		{/snippet}
	</PageHeader>
	{#if view === 'kanban'}<Kanban {filter} />{:else}<Matrix {filter} />{/if}
</Page>
