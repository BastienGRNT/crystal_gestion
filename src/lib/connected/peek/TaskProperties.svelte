<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { quadrantOf, QUADRANT_LABELS } from '$lib/modules/tasks/domain/eisenhower';
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
	const importance = $derived(task.important === null ? 'auto' : task.important ? 'yes' : 'no');
	const toImportant = (value: string) => (value === 'auto' ? null : value === 'yes');
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
	<PropertyRow label="Importance">
		<Segmented
			label="Importance"
			value={importance}
			options={[
				{ value: 'auto', label: 'Auto' },
				{ value: 'yes', label: 'Importante' },
				{ value: 'no', label: 'Secondaire' }
			]}
			onchange={(value) => actions.tasks.update(task.id, { important: toImportant(value) })}
		/>
	</PropertyRow>
	<PropertyRow label="Priorité">
		<span class="text-[13px] text-ink-2"
			>{QUADRANT_LABELS[quadrantOf(task, priority, new Date())]}</span
		>
	</PropertyRow>
	<PropertyRow label="Temps passé"><TimeSpent taskId={task.id} /></PropertyRow>
</div>
