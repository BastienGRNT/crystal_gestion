<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { quickTask } from '$lib/client/views/quick-add';
	import { TaskSources } from '$lib/client/views/task-sources.svelte';
	import {
		groupByQuadrant,
		QUADRANT_AXES,
		QUADRANT_LABELS,
		QUADRANTS,
		type Quadrant
	} from '$lib/modules/tasks/domain/eisenhower';
	import { isActive } from '$lib/modules/tasks/domain/task';
	import MiniMatrix from '$lib/ui/organisms/tasks/MiniMatrix.svelte';
	import { QUADRANT_COLORS, QUADRANT_HINTS } from '../tasks/quadrants';

	const { store, actions, me, peek } = useProject();
	const sources = new TaskSources(store);
	const mine = $derived(
		store.tasks.items.filter((t) => isActive(t) && t.assigneeIds.includes(me.id))
	);
	const groups = $derived(groupByQuadrant(mine, sources.priorityOf, new Date()));
	const cells = $derived(
		QUADRANTS.map((q) => ({
			...{ key: q, label: QUADRANT_LABELS[q], hint: QUADRANT_HINTS[q], color: QUADRANT_COLORS[q] },
			tasks: groups[q].map(sources.card)
		}))
	);
</script>

<MiniMatrix
	{cells}
	onmove={(id, q) => actions.tasks.update(id, QUADRANT_AXES[q as Quadrant])}
	onopen={peek}
	ontoggle={(id) => actions.tasks.finish(id)}
	onadd={(q, text) =>
		actions.tasks.create(
			quickTask(store, text, { assigneeIds: [me.id], ...QUADRANT_AXES[q as Quadrant] })
		)}
/>
