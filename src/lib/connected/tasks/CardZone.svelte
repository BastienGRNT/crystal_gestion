<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useApp } from '$lib/client/context';
	import { dnd, reflow } from '$lib/client/dnd.svelte';
	import { firstName, joinNames } from '$lib/client/format';
	import { now } from '$lib/client/now.svelte';
	import { waitingOn } from '$lib/client/views/questions';
	import { threadOf } from '$lib/client/views/workspace';
	import { daysInColumn, STALE_DAYS } from '$lib/modules/tasks/domain/views';
	import type { Task, TaskStatus } from '$lib/modules/tasks/domain/task';
	import DropSlot from '$lib/ui/atoms/DropSlot.svelte';
	import TaskCard from '$lib/ui/organisms/TaskCard.svelte';
	import { stepFilter } from './step-filter.svelte';

	interface Props {
		zone: string;
		tasks: Task[];
		ondrop: (taskId: string, index: number) => void;
		/** Columns sorted on their own (latest first) take a drop at the top. */
		dropAtStart?: boolean;
		showPriority?: boolean;
		/** Shown when the zone has no card. */
		emptyLabel?: string;
		/** Rendered inside the zone, so hovering it counts (a priority group's title). */
		header?: Snippet;
	}

	let {
		zone,
		tasks,
		ondrop,
		dropAtStart = false,
		showPriority = true,
		emptyLabel,
		header
	}: Props = $props();
	const { app, actions, overlays } = useApp();
	const rows = $derived(dnd.rows(zone, tasks));
	const tagOf = (task: Task) => stepFilter.view(app, task.projectId).tagOf(task);
	const empty = $derived(
		!rows.some((r) => r.item && r.item.id !== dnd.active?.id) && !dnd.isOver(zone)
	);

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

	const waiting = (taskId: string) =>
		joinNames(
			waitingOn(app.questions.all, threadOf(app.channels.all, taskId)?.id).map((id) =>
				firstName(app.users.get(id)?.name ?? '')
			)
		) || undefined;

	const stale = (task: Task) => {
		if (task.status !== 'doing' && task.status !== 'review') return null;
		const days = daysInColumn(task, now.value);
		return days >= STALE_DAYS ? days : null;
	};
</script>

<div
	{@attach dnd.dropzone(zone, ondrop, { at: dropAtStart ? 'start' : undefined })}
	class="relative flex flex-col gap-2"
>
	{@render header?.()}
	{#each rows as row (row.key)}
		<div animate:reflow {@attach row.item && dnd.draggable(row.item.id, zone)}>
			{#if row.item}
				{@const task = row.item}
				{@const next = NEXT[task.status]}
				<TaskCard
					{task}
					{showPriority}
					assignee={app.users.get(task.assigneeId)}
					reviewer={task.status === 'review' ? app.users.get(task.reviewerId) : undefined}
					today={now.today}
					comments={comments(task.id)}
					staleDays={stale(task)}
					waitingOn={waiting(task.id)}
					next={next?.label}
					step={tagOf(task)}
					onnext={() => next?.run(task.id)}
					onopen={() => overlays.openTask(task.id)}
					oncomplete={() => actions.tasks.complete(task.id)}
					onreopen={() => actions.tasks.update(task.id, { status: 'todo' })}
				/>
			{:else}
				<DropSlot height={dnd.active?.height ?? 0} />
			{/if}
		</div>
	{/each}
	{#if empty && emptyLabel}
		<p class="px-2 py-6 text-center text-sm text-ink-3">{emptyLabel}</p>
	{/if}
</div>
