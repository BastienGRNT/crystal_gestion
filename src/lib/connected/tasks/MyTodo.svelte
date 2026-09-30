<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { TaskSources } from '$lib/client/views/task-sources.svelte';
	import {
		groupByQuadrant,
		QUADRANT_LABELS,
		QUADRANTS
	} from '$lib/modules/tasks/domain/eisenhower';
	import QuickAdd from '$lib/ui/molecules/QuickAdd.svelte';
	import TodoList from '$lib/ui/organisms/tasks/TodoList.svelte';
	import { QUADRANT_HINTS, QUADRANT_TONES } from './quadrants';

	let { limitDone = 5 }: { limitDone?: number } = $props();
	const { store, actions, me, peek } = useProject();
	const sources = new TaskSources(store);
	const mine = $derived(store.tasks.items.filter((task) => task.assigneeIds.includes(me.id)));
	const quadrants = $derived(
		groupByQuadrant(
			mine.filter((t) => t.status !== 'done'),
			sources.priorityOf,
			new Date()
		)
	);
	const recentlyDone = $derived(
		mine
			.filter((t) => t.status === 'done')
			.sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''))
			.slice(0, limitDone)
	);
	const groups = $derived([
		...QUADRANTS.map((q) => ({
			key: q,
			label: QUADRANT_LABELS[q],
			hint: QUADRANT_HINTS[q],
			tone: QUADRANT_TONES[q],
			tasks: quadrants[q].map(sources.card)
		})),
		{
			key: 'done',
			label: 'Fait récemment',
			hint: '',
			tone: 'bg-success',
			tasks: recentlyDone.map(sources.card)
		}
	]);
	const toggle = (id: string, done: boolean) =>
		done ? actions.tasks.finish(id) : actions.tasks.move(id, 'todo');
</script>

<div class="mb-6">
	<QuickAdd
		placeholder="Nouvelle tâche pour moi… (Entrée)"
		onadd={(title) => actions.tasks.create({ title, assigneeIds: [me.id] })}
	/>
</div>
<TodoList
	{groups}
	empty="Rien pour toi pour l’instant. Ajoute une tâche ci-dessus, ou prends-en une dans Tâches."
	ontoggle={toggle}
	onopen={peek}
	onstart={(id) => actions.tasks.start(id)}
/>
