<script lang="ts">
	import { useProject } from '$lib/client/context';
	import {
		byPosition,
		dropPosition,
		matchesFilter,
		outsideArchive,
		type TaskFilter
	} from '$lib/client/views/kanban';
	import { TaskSources } from '$lib/client/views/task-sources.svelte';
	import { TASK_STATUSES, type TaskStatus } from '$lib/modules/tasks/domain/task';
	import KanbanBoard from '$lib/ui/organisms/tasks/KanbanBoard.svelte';

	let { filter }: { filter: TaskFilter } = $props();
	const { store, actions, peek } = useProject();
	const sources = new TaskSources(store);
	const visible = $derived(
		outsideArchive(new Set(store.features.items.filter((f) => f.archivedAt).map((f) => f.id)))
	);

	const tasksByStatus = $derived(
		Object.fromEntries(
			TASK_STATUSES.map((status) => [
				status,
				store.tasks.items
					.filter((t) => t.status === status && matchesFilter(t, filter) && visible(t))
					.sort(byPosition)
			])
		) as Record<TaskStatus, typeof store.tasks.items>
	);
	const columns = $derived(
		Object.fromEntries(
			TASK_STATUSES.map((status) => [status, tasksByStatus[status].map(sources.card)])
		) as Record<TaskStatus, ReturnType<typeof sources.card>[]>
	);

	function move(id: string, status: TaskStatus, index: number) {
		actions.tasks.move(id, status, dropPosition(tasksByStatus[status], id, index));
	}

	function add(status: TaskStatus, title: string, isFix: boolean) {
		const assigneeIds = filter.person ? [filter.person] : [];
		const featureId = filter.feature && filter.feature !== 'none' ? filter.feature : null;
		actions.tasks.create({
			title,
			status,
			assigneeIds,
			featureId,
			isFix: isFix || !!filter.bugsOnly
		});
	}
</script>

<KanbanBoard {columns} onmove={move} onopen={peek} onadd={add} />
