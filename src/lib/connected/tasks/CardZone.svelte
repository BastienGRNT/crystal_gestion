<script lang="ts">
	import { useApp } from '$lib/client/context';
	import { dnd } from '$lib/client/dnd.svelte';
	import { now } from '$lib/client/now.svelte';
	import { threadOf } from '$lib/client/views/workspace';
	import { daysInColumn, STALE_DAYS } from '$lib/modules/tasks/domain/views';
	import type { Task, TaskStatus } from '$lib/modules/tasks/domain/task';
	import DropLine from '$lib/ui/atoms/DropLine.svelte';
	import TaskCard from '$lib/ui/organisms/TaskCard.svelte';

	interface Props {
		zone: string;
		tasks: Task[];
		ondrop: (taskId: string, index: number) => void;
		showPriority?: boolean;
		/** Shown in an empty zone while a card is dragged. */
		emptyLabel?: string;
	}

	let { zone, tasks, ondrop, showPriority = true, emptyLabel = 'Dépose ici' }: Props = $props();
	const { app, actions, overlays } = useApp();
	const visible = $derived(tasks.filter((t) => t.id !== dnd.active?.id));
	const order = $derived(new Map(visible.map((t, i) => [t.id, i])));

	/** One click moves a card along the flow. */
	const NEXT: Partial<Record<TaskStatus, { label: string; run: (id: string) => void }>> = {
		idea: { label: 'À faire', run: (id) => actions.tasks.update(id, { status: 'todo' }) },
		todo: { label: 'Commencer', run: (id) => actions.tasks.start(id) },
		doing: { label: 'À relire', run: (id) => actions.tasks.askReview(id) },
		review: { label: 'Terminer', run: (id) => actions.tasks.complete(id) }
	};

	const comments = (taskId: string) => {
		const thread = threadOf(app.channels.all, taskId);
		return thread ? (app.channelStates.get(thread.id)?.total ?? 0) : 0;
	};

	const stale = (task: Task) => {
		if (task.status !== 'doing' && task.status !== 'review') return null;
		const days = daysInColumn(task, now.value);
		return days >= STALE_DAYS ? days : null;
	};
</script>

<div {@attach dnd.dropzone(zone, ondrop)} class="flex min-h-12 flex-col gap-2">
	{#each tasks as task (task.id)}
		{@const index = order.get(task.id)}
		{@const next = NEXT[task.status]}
		{#if index !== undefined && dnd.lineAt(zone, index)}<DropLine />{/if}
		<div {@attach dnd.draggable(task.id, zone)}>
			<TaskCard
				{task}
				{showPriority}
				assignee={app.users.get(task.assigneeId)}
				reviewer={task.status === 'review' ? app.users.get(task.reviewerId) : undefined}
				today={now.today}
				comments={comments(task.id)}
				staleDays={stale(task)}
				next={next?.label}
				onnext={() => next?.run(task.id)}
				onopen={() => overlays.openTask(task.id)}
				oncomplete={() => actions.tasks.complete(task.id)}
				onreopen={() => actions.tasks.update(task.id, { status: 'todo' })}
			/>
		</div>
	{/each}
	{#if dnd.lineAt(zone, visible.length)}<DropLine />{/if}
	{#if dnd.active && !visible.length}
		<p
			class="rounded-xl border-2 border-dashed border-line-strong py-4 text-center text-sm text-ink-3"
		>
			{emptyLabel}
		</p>
	{/if}
</div>
