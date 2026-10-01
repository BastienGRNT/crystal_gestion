<script lang="ts">
	import { formatMinutes } from '$lib/modules/time/domain/time-entry';
	import { relativeDueDate } from '$lib/client/format';
	import type { TaskCardView } from '$lib/client/views/task-card';
	import BugMark from '../atoms/BugMark.svelte';
	import FeatureMark from '../atoms/FeatureMark.svelte';
	import StatusIcon from '../atoms/StatusIcon.svelte';
	import AvatarStack from './AvatarStack.svelte';

	interface Props {
		task: TaskCardView;
		onopen: () => void;
		draggable?: boolean;
		ondragstart?: (event: DragEvent) => void;
		ondragend?: () => void;
		dragging?: boolean;
		/** In the kanban the column already says the status. */
		withStatus?: boolean;
	}

	let {
		task,
		onopen,
		draggable = false,
		ondragstart,
		ondragend,
		dragging = false,
		withStatus = true
	}: Props = $props();
	const dueColor = $derived(
		task.dueTone === 'late' ? 'text-must font-medium' : task.dueTone === 'soon' ? 'text-should' : ''
	);
</script>

<!-- Title first, one quiet line of metadata under it. -->
<button
	type="button"
	{draggable}
	{ondragstart}
	{ondragend}
	onclick={onopen}
	class="group relative flex w-full flex-col gap-2 overflow-hidden rounded-[10px] border border-line bg-surface px-3 py-2.5 text-left shadow-card transition hover:border-line-strong {dragging
		? 'opacity-40'
		: ''}"
>
	{#if task.running}<span class="absolute inset-x-0 top-0 h-[2px] prism" title="Chrono en cours"
		></span>{/if}
	<span class="flex items-start gap-2">
		{#if withStatus}<span class="mt-0.5"><StatusIcon status={task.status} size={14} /></span>{/if}
		{#if task.fix}<span class="mt-0.5"><BugMark size={13} /></span>{/if}
		<span class="text-sm leading-snug {task.done ? 'text-ink-3' : ''}">{task.title}</span>
	</span>
	<span class="flex min-w-0 items-center gap-3 text-xs text-ink-3">
		{#if task.feature}<span class="flex min-w-0 flex-1 overflow-hidden"
				><FeatureMark title={task.feature.title} color={task.feature.color} /></span
			>{/if}
		{#if task.dueDate}<span class="shrink-0 whitespace-nowrap {dueColor}"
				>{relativeDueDate(task.dueDate)}</span
			>{/if}
		{#if task.minutes}<span class="shrink-0 whitespace-nowrap">{formatMinutes(task.minutes)}</span
			>{/if}
		<span class="ml-auto shrink-0"><AvatarStack people={task.assignees} size={18} /></span>
	</span>
</button>
