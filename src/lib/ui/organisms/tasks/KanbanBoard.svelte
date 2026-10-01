<script lang="ts">
	import { STATUS_LABELS, TASK_STATUSES, type TaskStatus } from '$lib/modules/tasks/domain/task';
	import type { TaskCardView } from '$lib/client/views/task-card';
	import KanbanColumn from './KanbanColumn.svelte';

	interface Props {
		columns: Record<TaskStatus, TaskCardView[]>;
		onmove: (id: string, status: TaskStatus, index: number) => void;
		onopen: (ref: string) => void;
		onadd: (status: TaskStatus, title: string, isFix: boolean) => void;
	}

	let { columns, onmove, onopen, onadd }: Props = $props();
	let draggingId = $state<string | null>(null);
	const tones: Record<TaskStatus, string> = {
		icebox: 'bg-line-strong',
		todo: 'bg-ink-3',
		in_progress: 'bg-should',
		review: 'bg-accent',
		done: 'bg-success'
	};
</script>

<div
	class="-mx-4 flex snap-x snap-mandatory items-start gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0"
>
	{#each TASK_STATUSES as status (status)}
		<KanbanColumn
			label={STATUS_LABELS[status]}
			tone={tones[status]}
			hint={status === 'icebox' ? 'Noté pour plus tard, on n’y pense pas encore.' : undefined}
			cards={columns[status]}
			{draggingId}
			ondragstart={(id) => (draggingId = id)}
			ondragend={() => (draggingId = null)}
			ondrop={(index) => draggingId && onmove(draggingId, status, index)}
			{onopen}
			onadd={(title, isFix) => onadd(status, title, isFix)}
		/>
	{/each}
</div>
