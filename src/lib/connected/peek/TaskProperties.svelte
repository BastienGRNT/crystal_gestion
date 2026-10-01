<script lang="ts">
	import { Bug, CalendarDays, Layers, UserRound } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import { relativeDueDate } from '$lib/client/format';
	import {
		dueOptions,
		featureOptions,
		peopleOptions,
		statusOptions
	} from '$lib/client/views/task-menus';
	import { TaskSources } from '$lib/client/views/task-sources.svelte';
	import { STATUS_LABELS, type Task } from '$lib/modules/tasks/domain/task';
	import DatePickButton from '$lib/ui/atoms/DatePickButton.svelte';
	import FeatureMark from '$lib/ui/atoms/FeatureMark.svelte';
	import StatusIcon from '$lib/ui/atoms/StatusIcon.svelte';
	import AvatarStack from '$lib/ui/molecules/AvatarStack.svelte';
	import PropButton from '$lib/ui/molecules/PropButton.svelte';
	import PropertyRow from '$lib/ui/molecules/PropertyRow.svelte';
	import TaskUrgency from './TaskUrgency.svelte';
	import TimeSpent from './TimeSpent.svelte';

	let { task }: { task: Task } = $props();
	const { store, actions, me } = useProject();
	const sources = new TaskSources(store);
	const card = $derived(sources.card(task));
	const update = (changes: Partial<Task>) => actions.tasks.update(task.id, changes);
	const toggle = (id: string) =>
		update({
			assigneeIds: task.assigneeIds.includes(id)
				? task.assigneeIds.filter((x) => x !== id)
				: [...task.assigneeIds, id]
		});
	const dueTone = $derived(
		card.dueTone === 'late' ? 'text-must font-medium' : card.dueTone === 'soon' ? 'text-should' : ''
	);
</script>

<div class="flex flex-col">
	<PropertyRow label="Statut">
		<PropButton
			ghost
			label="Statut"
			icon={Bug}
			options={statusOptions(task.status)}
			onpick={(status) => actions.tasks.move(task.id, status)}
		>
			{#snippet value()}<StatusIcon status={task.status} size={15} />{STATUS_LABELS[
					task.status
				]}{/snippet}
		</PropButton>
	</PropertyRow>
	<PropertyRow label="Pour qui">
		<PropButton
			ghost
			multiple
			label="Personne"
			icon={UserRound}
			options={peopleOptions(store.members.items, me.id, task.assigneeIds)}
			onpick={toggle}
			value={card.assignees.length ? people : undefined}
		/>
	</PropertyRow>
	<PropertyRow label="Échéance">
		<div class="flex items-center gap-1">
			<PropButton
				ghost
				label="Aucune"
				icon={CalendarDays}
				options={dueOptions(task.dueDate)}
				onpick={(dueDate) => update({ dueDate })}
				value={task.dueDate ? due : undefined}
			/>
			<DatePickButton
				label="Choisir une date"
				value={task.dueDate}
				onchange={(dueDate) => update({ dueDate })}
			/>
		</div>
	</PropertyRow>
	<PropertyRow label="Feature">
		<PropButton
			ghost
			label="Sans feature"
			icon={Layers}
			options={featureOptions(store.features.items, task.featureId)}
			onpick={(featureId) => update({ featureId })}
			value={card.feature ? feature : undefined}
		/>
	</PropertyRow>
	<PropertyRow label="Urgence"><TaskUrgency {task} /></PropertyRow>
	<PropertyRow label="Temps passé"><TimeSpent {task} /></PropertyRow>
	<PropertyRow label="Bug">
		<label class="flex h-8 items-center gap-2 px-2.5 text-ui text-ink-2">
			<input
				type="checkbox"
				checked={task.isFix}
				onchange={(e) => update({ isFix: e.currentTarget.checked })}
				class="accent-[var(--must)]"
			/>
			C’est quelque chose à corriger
		</label>
	</PropertyRow>
</div>

{#snippet people()}<AvatarStack people={card.assignees} size={18} /><span class="truncate"
		>{card.assignees.map((p) => (p.id === me.id ? 'Moi' : p.name)).join(', ')}</span
	>{/snippet}
{#snippet due()}<span class={dueTone}>{relativeDueDate(task.dueDate!)}</span>{/snippet}
{#snippet feature()}<FeatureMark
		title={card.feature!.title}
		color={card.feature!.color}
	/>{/snippet}
