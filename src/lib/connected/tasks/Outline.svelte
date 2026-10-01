<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { matchesFilter, type TaskFilter } from '$lib/client/views/kanban';
	import { TaskSources } from '$lib/client/views/task-sources.svelte';
	import { byPriority, isArchived } from '$lib/modules/features/domain/feature';
	import FeatureGroup from './FeatureGroup.svelte';
	import IceboxGroup from './IceboxGroup.svelte';

	/** The list view: every feat as a card with its tasks, then loose work, then the icebox. */
	let { filter }: { filter: TaskFilter } = $props();
	const { store } = useProject();
	const sources = new TaskSources(store);
	const shown = $derived(store.tasks.items.filter((t) => matchesFilter(t, filter)));
	const active = $derived(
		[...store.features.items]
			.filter((f) => !isArchived(f) && f.priority !== 'wont')
			.filter((f) => !filter.feature || filter.feature === f.id)
			.sort(byPriority)
	);
	const tasksOf = (featureId: string | null) =>
		shown.filter((t) => t.featureId === featureId && t.status !== 'icebox');
	const icebox = $derived(shown.filter((t) => t.status === 'icebox'));
	const iceboxFeatures = $derived(
		store.features.items.filter((f) => !isArchived(f) && f.priority === 'wont')
	);
	const defaults = $derived({
		assigneeIds: filter.person ? [filter.person] : [],
		isFix: !!filter.bugsOnly
	});
	const unfiltered = $derived(!filter.feature);
</script>

{#each active as feature (feature.id)}
	<FeatureGroup {feature} tasks={tasksOf(feature.id)} {sources} {defaults} />
{/each}
{#if unfiltered || filter.feature === 'none'}
	<FeatureGroup feature={null} tasks={tasksOf(null)} {sources} {defaults} />
{/if}
{#if unfiltered}
	<IceboxGroup features={iceboxFeatures} tasks={icebox} {sources} {defaults} />
{/if}
