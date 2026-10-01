<script lang="ts">
	import { Grid2x2 } from '@lucide/svelte';
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
	import Dot from '$lib/ui/atoms/Dot.svelte';
	import PropButton from '$lib/ui/molecules/PropButton.svelte';
	import { QUADRANT_COLORS, QUADRANT_HINTS } from '../tasks/quadrants';

	/** The matrix quadrant: computed from the feature and the due date unless placed by hand. */
	let { task }: { task: Task } = $props();
	const { store, actions } = useProject();
	const priority = $derived(store.features.get(task.featureId ?? '')?.priority ?? null);
	const current = $derived(quadrantOf(task, priority, new Date()));
	const byHand = $derived(isPlacedByHand(task));
	const automatic = $derived(
		quadrantOf({ ...task, important: null, urgent: null }, priority, new Date())
	);
	const options = $derived([
		{ value: 'auto', label: 'Automatique', hint: QUADRANT_LABELS[automatic], active: !byHand },
		...QUADRANTS.map((q) => ({
			...{ value: q as string, label: QUADRANT_LABELS[q], hint: QUADRANT_HINTS[q] },
			...{ dot: QUADRANT_COLORS[q], active: byHand && q === current }
		}))
	]);
	const change = (value: string) =>
		actions.tasks.update(
			task.id,
			value === 'auto' ? { important: null, urgent: null } : QUADRANT_AXES[value as Quadrant]
		);
</script>

<PropButton ghost label="Urgence" icon={Grid2x2} {options} onpick={change}>
	{#snippet value()}<Dot color={QUADRANT_COLORS[current]} size={8} />{QUADRANT_LABELS[current]}
		<span class="text-xs text-ink-3">{byHand ? '· placée à la main' : '· auto'}</span>{/snippet}
</PropButton>
