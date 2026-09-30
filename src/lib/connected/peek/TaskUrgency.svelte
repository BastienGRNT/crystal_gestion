<script lang="ts">
	import { useProject } from '$lib/client/context';
	import {
		isPlacedByHand,
		QUADRANT_AXES,
		QUADRANT_LABELS,
		QUADRANTS,
		quadrantOf,
		type Quadrant
	} from '$lib/modules/tasks/domain/eisenhower';
	import type { Task } from '$lib/modules/tasks/domain/task';
	import Select from '$lib/ui/atoms/Select.svelte';

	/** The matrix quadrant: computed from the feature and the due date unless placed by hand. */
	let { task }: { task: Task } = $props();
	const { store, actions } = useProject();
	const priority = $derived(store.features.get(task.featureId ?? '')?.priority ?? null);
	const automatic = $derived(
		quadrantOf({ ...task, important: null, urgent: null }, priority, new Date())
	);
	const options = $derived([
		{ value: 'auto', label: `Automatique (${QUADRANT_LABELS[automatic]})` },
		...QUADRANTS.map((q) => ({ value: q, label: QUADRANT_LABELS[q] }))
	]);
	const change = (value: string) =>
		actions.tasks.update(
			task.id,
			value === 'auto' ? { important: null, urgent: null } : QUADRANT_AXES[value as Quadrant]
		);
</script>

<Select
	label="Urgence"
	value={isPlacedByHand(task) ? quadrantOf(task, priority, new Date()) : 'auto'}
	{options}
	onchange={change}
	class="w-full"
/>
