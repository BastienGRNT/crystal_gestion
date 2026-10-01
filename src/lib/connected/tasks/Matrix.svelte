<script lang="ts">
	import { isActive } from '$lib/modules/tasks/domain/task';
	import { useProject } from '$lib/client/context';
	import { matchesFilter, outsideArchive, type TaskFilter } from '$lib/client/views/kanban';
	import { TaskSources } from '$lib/client/views/task-sources.svelte';
	import {
		groupByQuadrant,
		QUADRANT_AXES,
		QUADRANT_LABELS,
		QUADRANTS,
		type Quadrant
	} from '$lib/modules/tasks/domain/eisenhower';
	import MatrixGrid from '$lib/ui/organisms/tasks/Matrix.svelte';
	import { QUADRANT_HINTS, QUADRANT_TONES } from './quadrants';

	let { filter }: { filter: TaskFilter } = $props();
	const { store, actions, peek } = useProject();
	const sources = new TaskSources(store);
	const visible = $derived(
		outsideArchive(new Set(store.features.items.filter((f) => f.archivedAt).map((f) => f.id)))
	);
	const open = $derived(
		store.tasks.items.filter((t) => isActive(t) && matchesFilter(t, filter) && visible(t))
	);
	const groups = $derived(groupByQuadrant(open, sources.priorityOf, new Date()));
	const cells = $derived(
		QUADRANTS.map((q) => ({
			...{ key: q, label: QUADRANT_LABELS[q], hint: QUADRANT_HINTS[q], tone: QUADRANT_TONES[q] },
			cards: groups[q].map(sources.card)
		}))
	);
	const add = (quadrant: string, title: string, isFix: boolean) =>
		actions.tasks.create({
			title,
			isFix: isFix || !!filter.bugsOnly,
			...QUADRANT_AXES[quadrant as Quadrant],
			assigneeIds: filter.person ? [filter.person] : [],
			featureId: filter.feature && filter.feature !== 'none' ? filter.feature : null
		});
</script>

<MatrixGrid
	{cells}
	onmove={(id, quadrant) => actions.tasks.update(id, QUADRANT_AXES[quadrant as Quadrant])}
	onopen={peek}
	onadd={add}
/>
