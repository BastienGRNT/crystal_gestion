<script lang="ts">
	import { useProject } from '$lib/client/context';
	import type { TaskCardView } from '$lib/client/views/task-card';
	import { TaskSources } from '$lib/client/views/task-sources.svelte';
	import { toasts } from '$lib/client/toasts.svelte';
	import {
		groupByQuadrant,
		QUADRANT_LABELS,
		QUADRANTS
	} from '$lib/modules/tasks/domain/eisenhower';
	import { isActive } from '$lib/modules/tasks/domain/task';
	import Card from '$lib/ui/molecules/Card.svelte';
	import QuickAdd from '$lib/ui/molecules/QuickAdd.svelte';
	import TaskGroups from '$lib/ui/organisms/tasks/TaskGroups.svelte';
	import TaskItem from '../tasks/TaskItem.svelte';
	import { QUADRANT_COLORS, QUADRANT_HINTS } from '../tasks/quadrants';

	const { store, actions, me, peek } = useProject();
	const sources = new TaskSources(store);
	const mine = $derived(
		store.tasks.items.filter((t) => isActive(t) && t.assigneeIds.includes(me.id))
	);
	const quadrants = $derived(groupByQuadrant(mine, sources.priorityOf, new Date()));
	const groups = $derived(
		QUADRANTS.filter((q) => quadrants[q].length).map((q) => ({
			...{ key: q, label: QUADRANT_LABELS[q], hint: QUADRANT_HINTS[q], color: QUADRANT_COLORS[q] },
			tasks: quadrants[q].map(sources.card)
		}))
	);

	async function add(title: string) {
		const task = await actions.tasks.create({ title, assigneeIds: [me.id] });
		if (task)
			toasts.show(`${task.ref} ajoutée à tes tâches`, 'success', {
				action: { label: 'Ouvrir', run: () => peek(task.ref) }
			});
	}
</script>

{#snippet row(task: TaskCardView)}<TaskItem {task} compact />{/snippet}

<Card
	title="Mes tâches"
	link={{ label: 'Toutes les tâches', href: `/p/${store.project.slug}/tasks` }}
>
	<div class="-mx-2">
		<QuickAdd placeholder="Ajouter une tâche pour moi — Entrée pour valider" onadd={add} />
		<TaskGroups {groups} {row} inset />
		{#if !groups.length}
			<p class="px-2.5 pt-2 pb-1 text-ui text-ink-3">
				Rien pour toi. Ajoute une tâche ci-dessus ou prends-en une dans Tâches.
			</p>
		{/if}
	</div>
</Card>
