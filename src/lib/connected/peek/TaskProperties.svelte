<script lang="ts">
	import { SquareCheckBig, Wrench } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import { dueChoices } from '$lib/client/views/due-choices';
	import { featureOptions } from '$lib/client/views/task-menus';
	import { TaskSources } from '$lib/client/views/task-sources.svelte';
	import type { Task } from '$lib/modules/tasks/domain/task';
	import FeatureMark from '$lib/ui/atoms/FeatureMark.svelte';
	import ChoiceCards from '$lib/ui/molecules/form/ChoiceCards.svelte';
	import FormField from '$lib/ui/molecules/form/FormField.svelte';
	import PeopleChoice from '$lib/ui/molecules/form/PeopleChoice.svelte';
	import SelectField from '$lib/ui/molecules/form/SelectField.svelte';
	import StatusChoice from '$lib/ui/molecules/form/StatusChoice.svelte';
	import WhenChoice from '$lib/ui/molecules/form/WhenChoice.svelte';
	import TaskUrgency from './TaskUrgency.svelte';
	import TimeSpent from './TimeSpent.svelte';

	/** The same questions as the creation form, saved as soon as they are answered. */
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
	const kind = $derived(task.isFix ? 'Fix' : 'Task');
</script>

<div class="flex flex-col gap-6">
	<FormField label="Où en est-elle ?">
		<StatusChoice value={task.status} onchange={(status) => actions.tasks.move(task.id, status)} />
	</FormField>
	<FormField label="C’est…">
		<ChoiceCards
			label="Type"
			value={kind}
			onchange={(v) => update({ isFix: v === 'Fix' })}
			choices={[
				{ value: 'Task', label: 'Une Task', hint: 'Quelque chose à faire', icon: SquareCheckBig },
				{
					...{ value: 'Fix', label: 'Un Fix', hint: 'Quelque chose à corriger' },
					...{ icon: Wrench, color: 'var(--must)' }
				}
			]}
		/>
	</FormField>
	<FormField label="Dans quelle Feat ?">
		<SelectField
			label="Feat"
			options={featureOptions(store.features.items, task.featureId)}
			onpick={(featureId) => update({ featureId })}
		>
			{#snippet value()}
				{#if card.feature}<FeatureMark title={card.feature.title} color={card.feature.color} />
				{:else}<span class="text-ink-3">Aucune, c’est à part</span>{/if}
			{/snippet}
		</SelectField>
	</FormField>
	<FormField label="Qui s’en occupe ?">
		<PeopleChoice
			label="Qui s’en occupe"
			people={store.members.items}
			selected={task.assigneeIds}
			meId={me.id}
			ontoggle={toggle}
		/>
	</FormField>
	<FormField label="Pour quand ?">
		<WhenChoice
			choices={dueChoices(new Date()).map((c) => (c.value ? c : { ...c, label: 'Pas de date' }))}
			value={task.dueDate}
			onchange={(dueDate) => update({ dueDate })}
		/>
	</FormField>
	<FormField
		label="Qui valide ?"
		hint={task.reviewerId
			? 'Cochée, elle passe « À valider » chez cette personne.'
			: 'Sans valideur, cochée = Fait.'}
	>
		<PeopleChoice
			label="Qui valide"
			people={store.members.items}
			selected={task.reviewerId ? [task.reviewerId] : []}
			meId={me.id}
			ontoggle={(id) => update({ reviewerId: task.reviewerId === id ? null : id })}
			none={{
				label: 'Personne',
				active: !task.reviewerId,
				onpick: () => update({ reviewerId: null })
			}}
		/>
	</FormField>
	<FormField
		label="Urgence"
		hint="Calculée depuis la Feat et l’échéance. Tu peux la forcer, ou glisser la Task dans la matrice."
	>
		<TaskUrgency {task} />
	</FormField>
	<FormField label="Temps passé"><TimeSpent {task} /></FormField>
</div>
