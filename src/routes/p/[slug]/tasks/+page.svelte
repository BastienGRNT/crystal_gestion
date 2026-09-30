<script lang="ts">
	import { useProject } from '$lib/client/context';
	import type { TaskFilter } from '$lib/client/views/kanban';
	import Kanban from '$lib/connected/tasks/Kanban.svelte';
	import MyTodo from '$lib/connected/tasks/MyTodo.svelte';
	import Segmented from '$lib/ui/molecules/Segmented.svelte';
	import TaskFilters from '$lib/ui/organisms/tasks/TaskFilters.svelte';
	import Page from '$lib/ui/templates/Page.svelte';
	import PageHeader from '$lib/ui/templates/PageHeader.svelte';

	const { store, actions, me } = useProject();
	let view = $state<'kanban' | 'todo'>(me.preferences.taskView ?? 'kanban');
	let filter = $state<TaskFilter>({ person: '', feature: '' });
	const open = $derived(store.tasks.items.filter((task) => task.status !== 'done').length);

	function choose(next: 'kanban' | 'todo') {
		view = next;
		actions.project.setTaskView(next);
	}
</script>

<svelte:head><title>Tâches · {store.project.name}</title></svelte:head>

<Page width={view === 'kanban' ? 'max-w-[1400px]' : 'max-w-3xl'}>
	<PageHeader eyebrow="{open} en cours ou à faire" title={view === 'kanban' ? 'Tâches' : 'Ma liste'}>
		{#snippet actions()}
			{#if view === 'kanban'}
				<TaskFilters
					person={filter.person}
					feature={filter.feature}
					people={store.members.items.map((m) => ({ value: m.id, label: m.id === me.id ? `${m.name} (moi)` : m.name }))}
					features={store.features.items.map((f) => ({ value: f.id, label: f.title }))}
					onchange={(next) => (filter = next)}
				/>
			{/if}
			<Segmented label="Vue" value={view} options={[{ value: 'kanban', label: 'Kanban' }, { value: 'todo', label: 'Ma liste' }]} onchange={choose} />
		{/snippet}
	</PageHeader>
	{#if view === 'kanban'}<Kanban {filter} />{:else}<MyTodo />{/if}
</Page>
