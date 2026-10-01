<script lang="ts">
	import { Bug } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import { overlays } from '$lib/client/overlays.svelte';
	import { byPosition } from '$lib/client/views/kanban';
	import { TaskSources } from '$lib/client/views/task-sources.svelte';
	import QuickAdd from '$lib/ui/molecules/QuickAdd.svelte';
	import TaskItem from '../tasks/TaskItem.svelte';

	let { featureId }: { featureId: string } = $props();
	const { store, actions } = useProject();
	const sources = new TaskSources(store);
	const order = ['in_progress', 'review', 'todo', 'icebox', 'done'] as const;
	const tasks = $derived(
		store.tasks.items
			.filter((task) => task.featureId === featureId)
			.sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status) || byPosition(a, b))
	);
</script>

<div class="-mx-2">
	<div class="flex items-center gap-2">
		<div class="flex-1">
			<QuickAdd
				placeholder="Ajouter une tâche à cette feature — Entrée"
				onadd={(title) => actions.tasks.create({ title, featureId })}
			/>
		</div>
		<button
			type="button"
			onclick={() => overlays.openCreate('bug', { featureId })}
			class="inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs text-ink-2 hover:bg-hover"
			><Bug size={13} class="text-must" />Signaler un bug</button
		>
	</div>
	{#each tasks as task (task.id)}<TaskItem task={sources.card(task)} withFeature={false} />{/each}
</div>
