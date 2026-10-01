<script lang="ts">
	import { ListTodo } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import type { TaskCardView } from '$lib/client/views/task-card';
	import { overlays } from '$lib/client/overlays.svelte';
	import { matchesFilter, type TaskFilter } from '$lib/client/views/kanban';
	import { TaskSources } from '$lib/client/views/task-sources.svelte';
	import {
		groupByQuadrant,
		QUADRANT_LABELS,
		QUADRANTS
	} from '$lib/modules/tasks/domain/eisenhower';
	import { isActive } from '$lib/modules/tasks/domain/task';
	import Collapsible from '$lib/ui/molecules/Collapsible.svelte';
	import EmptyState from '$lib/ui/molecules/EmptyState.svelte';
	import TaskGroups from '$lib/ui/organisms/tasks/TaskGroups.svelte';
	import { QUADRANT_COLORS, QUADRANT_HINTS } from './quadrants';
	import TaskItem from './TaskItem.svelte';

	let { filter }: { filter: TaskFilter } = $props();
	const { store } = useProject();
	const sources = new TaskSources(store);
	const shown = $derived(store.tasks.items.filter((t) => matchesFilter(t, filter)));
	const quadrants = $derived(
		groupByQuadrant(shown.filter(isActive), sources.priorityOf, new Date())
	);
	const groups = $derived(
		QUADRANTS.filter((q) => quadrants[q].length).map((q) => ({
			...{ key: q, label: QUADRANT_LABELS[q], hint: QUADRANT_HINTS[q], color: QUADRANT_COLORS[q] },
			tasks: quadrants[q].map(sources.card)
		}))
	);
	const icebox = $derived(shown.filter((t) => t.status === 'icebox').map(sources.card));
	const done = $derived(
		shown
			.filter((t) => t.status === 'done')
			.sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''))
			.map(sources.card)
	);
</script>

{#snippet row(task: TaskCardView)}<TaskItem {task} />{/snippet}

<TaskGroups {groups} {row} />
{#if !groups.length}
	<div class="py-10">
		<EmptyState
			icon={ListTodo}
			title="Aucune tâche ouverte avec ces filtres"
			text="Crée-en une, ou élargis les filtres au-dessus."
		>
			<button
				class="h-8 rounded-lg bg-accent px-3 text-ui font-medium text-accent-ink"
				onclick={() => overlays.openCreate('task')}>Créer une tâche</button
			>
		</EmptyState>
	</div>
{/if}
{#if icebox.length}
	<Collapsible label="Icebox" count={icebox.length} hint="noté pour plus tard">
		{#each icebox as task (task.id)}{@render row(task)}{/each}
	</Collapsible>
{/if}
{#if done.length}
	<Collapsible label="Fait" count={done.length}>
		{#each done as task (task.id)}{@render row(task)}{/each}
	</Collapsible>
{/if}
