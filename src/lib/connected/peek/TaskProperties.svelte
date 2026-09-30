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
	import { STATUS_LABELS, TASK_STATUSES, type Task } from '$lib/modules/tasks/domain/task';
	import DateInput from '$lib/ui/atoms/DateInput.svelte';
	import Select from '$lib/ui/atoms/Select.svelte';
	import AssigneePicker from '$lib/ui/molecules/AssigneePicker.svelte';
	import PropertyRow from '$lib/ui/molecules/PropertyRow.svelte';
	import Segmented from '$lib/ui/molecules/Segmented.svelte';
	import TimeSpent from './TimeSpent.svelte';

	let { task }: { task: Task } = $props();
	const { store, actions } = useProject();
	const featureOptions = $derived([
		{ value: '', label: 'Aucune' },
		...store.features.items.map((f) => ({ value: f.id, label: `${f.ref} · ${f.title}` }))
	]);
	const priority = $derived(store.features.get(task.featureId ?? '')?.priority ?? null);
	const quadrant = $derived(quadrantOf(task, priority, new Date()));
	const urgencyOptions = $derived([
		{
			value: 'auto',
			label: `Automatique (${QUADRANT_LABELS[quadrantOf({ ...task, important: null, urgent: null }, priority, new Date())]})`
		},
		...QUADRANTS.map((q) => ({ value: q, label: QUADRANT_LABELS[q] }))
	]);
	const setUrgency = (value: string) =>
		actions.tasks.update(
			task.id,
			value === 'auto' ? { important: null, urgent: null } : QUADRANT_AXES[value as Quadrant]
		);
</script>

<div class="flex flex-col gap-1">
	<PropertyRow label="Statut">
		<Segmented
			label="Statut"
			value={task.status}
			options={TASK_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }))}
			onchange={(status) => actions.tasks.move(task.id, status)}
		/>
	</PropertyRow>
	<PropertyRow label="Feature">
		<Select
			label="Feature"
			value={task.featureId ?? ''}
			options={featureOptions}
			onchange={(id) => actions.tasks.update(task.id, { featureId: id || null })}
			class="w-full"
		/>
	</PropertyRow>
	<PropertyRow label="Assignés">
		<AssigneePicker
			people={store.members.items}
			selected={task.assigneeIds}
			onchange={(assigneeIds) => actions.tasks.update(task.id, { assigneeIds })}
		/>
	</PropertyRow>
	<PropertyRow label="Échéance">
		<DateInput
			label="Échéance"
			value={task.dueDate}
			onchange={(dueDate) => actions.tasks.update(task.id, { dueDate })}
		/>
	</PropertyRow>
	<PropertyRow label="Urgence">
		<Select
			label="Urgence"
			value={isPlacedByHand(task) ? quadrant : 'auto'}
			options={urgencyOptions}
			onchange={setUrgency}
			class="w-full"
		/>
	</PropertyRow>
	<PropertyRow label="Temps passé"><TimeSpent taskId={task.id} /></PropertyRow>
</div>
