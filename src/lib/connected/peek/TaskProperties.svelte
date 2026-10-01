<script lang="ts">
	import { ChevronDown } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import { dueChoices } from '$lib/client/views/due-choices';
	import { taskMenus } from '$lib/client/views/task-menus';
	import { TaskSources } from '$lib/client/views/task-sources.svelte';
	import { STATUS_LABELS, TASK_STATUSES, type Task } from '$lib/modules/tasks/domain/task';
	import DateInput from '$lib/ui/atoms/DateInput.svelte';
	import Dot from '$lib/ui/atoms/Dot.svelte';
	import DotPills from '$lib/ui/molecules/DotPills.svelte';
	import PersonPills from '$lib/ui/molecules/PersonPills.svelte';
	import PickMenu from '$lib/ui/molecules/PickMenu.svelte';
	import PropertyRow from '$lib/ui/molecules/PropertyRow.svelte';
	import { PRIORITY_COLORS, STATUS_COLORS } from '$lib/ui/tones';
	import TaskUrgency from './TaskUrgency.svelte';
	import TimeSpent from './TimeSpent.svelte';

	let { task }: { task: Task } = $props();
	const { store, actions, me } = useProject();
	const sources = new TaskSources(store);
	const card = $derived(sources.card(task));
	const menus = $derived(taskMenus(card, store.features.items, store.members.items, me.id));
	const toggle = (id: string) =>
		actions.tasks.update(task.id, {
			assigneeIds: task.assigneeIds.includes(id)
				? task.assigneeIds.filter((x) => x !== id)
				: [...task.assigneeIds, id]
		});
</script>

<div class="flex flex-col gap-1 text-ui">
	<PropertyRow label="Statut">
		<DotPills
			options={TASK_STATUSES.map((s) => ({
				value: s,
				label: STATUS_LABELS[s],
				dot: STATUS_COLORS[s]
			}))}
			value={task.status}
			onchange={(status) => actions.tasks.move(task.id, status)}
		/>
	</PropertyRow>
	<PropertyRow label="Pour">
		<PersonPills
			people={store.members.items}
			selected={task.assigneeIds}
			meId={me.id}
			ontoggle={toggle}
		/>
	</PropertyRow>
	<PropertyRow label="Échéance">
		<div class="flex flex-wrap items-center gap-1">
			<DotPills
				options={dueChoices(new Date()).filter((d) => d.value)}
				value={task.dueDate}
				onchange={(dueDate) => actions.tasks.update(task.id, { dueDate })}
			/>
			<DateInput
				label="Autre date"
				value={task.dueDate}
				onchange={(dueDate) => actions.tasks.update(task.id, { dueDate })}
			/>
		</div>
	</PropertyRow>
	<PropertyRow label="Feature">
		<PickMenu
			title="Feature"
			options={menus.feature}
			onpick={(featureId) => actions.tasks.update(task.id, { featureId })}
		>
			{#snippet trigger(toggleMenu)}
				<button
					type="button"
					onclick={toggleMenu}
					class="inline-flex h-7 items-center gap-1.5 rounded-[7px] border border-line px-2.5 text-xs font-medium hover:bg-hover"
				>
					<Dot
						color={card.feature ? PRIORITY_COLORS[card.feature.priority] : 'var(--line-strong)'}
					/>
					{card.feature?.title ?? 'Sans feature'}<ChevronDown size={13} class="text-ink-3" />
				</button>
			{/snippet}
		</PickMenu>
	</PropertyRow>
	<PropertyRow label="Type">
		<DotPills
			options={[
				{ value: 'task', label: 'Tâche' },
				{ value: 'bug', label: 'Bug', dot: 'var(--must)' }
			]}
			value={task.isFix ? 'bug' : 'task'}
			onchange={(type) => actions.tasks.update(task.id, { isFix: type === 'bug' })}
		/>
	</PropertyRow>
	<PropertyRow label="Urgence"><TaskUrgency {task} /></PropertyRow>
	<PropertyRow label="Temps passé"><TimeSpent taskId={task.id} /></PropertyRow>
</div>
