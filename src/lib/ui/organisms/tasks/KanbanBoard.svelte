<script lang="ts">
	import { STATUS_LABELS, TASK_STATUSES, type TaskStatus } from '$lib/modules/tasks/domain/task';
	import type { TaskCardView } from '$lib/client/views/task-card';
	import KanbanColumn from './KanbanColumn.svelte';

	interface Props {
		columns: Record<TaskStatus, TaskCardView[]>;
		onmove: (id: string, status: TaskStatus, index: number) => void;
		onopen: (ref: string) => void;
		onadd: (status: TaskStatus, title: string) => void;
	}

	let { columns, onmove, onopen, onadd }: Props = $props();
	let draggingId = $state<string | null>(null);
	const tones: Record<TaskStatus, string> = {
		todo: 'bg-ink-3',
		in_progress: 'bg-accent',
		review: 'bg-should',
		done: 'bg-success'
	};
</script>

<div class="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
	{#each TASK_STATUSES as status (status)}
		<KanbanColumn
			label={STATUS_LABELS[status]}
			tone={tones[status]}
			cards={columns[status]}
			{draggingId}
			ondragstart={(id) => (draggingId = id)}
			ondragend={() => (draggingId = null)}
			ondrop={(index) => draggingId && onmove(draggingId, status, index)}
			{onopen}
			onadd={(title) => onadd(status, title)}
		/>
	{/each}
</div>
