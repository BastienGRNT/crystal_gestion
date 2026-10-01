<script lang="ts">
	import { Pin } from '@lucide/svelte';
	import { formatMinutes } from '$lib/modules/time/domain/time-entry';
	import type { TaskCardView } from '$lib/client/views/task-card';
	import DueDate from '../atoms/DueDate.svelte';
	import BugMark from '../atoms/BugMark.svelte';
	import PriorityDot from '../atoms/PriorityDot.svelte';
	import AvatarStack from './AvatarStack.svelte';

	interface Props {
		task: TaskCardView;
		onopen: () => void;
		draggable?: boolean;
		ondragstart?: (event: DragEvent) => void;
		ondragend?: () => void;
		dragging?: boolean;
		/** Shows that the task was placed by hand in the matrix. */
		showPin?: boolean;
	}

	let {
		task,
		onopen,
		draggable = false,
		ondragstart,
		ondragend,
		dragging = false,
		showPin = false
	}: Props = $props();
</script>

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
	<span class="flex items-center gap-2 text-xs text-ink-3">
		<span class="font-mono">{task.ref}</span>
		{#if task.fix}<BugMark />{/if}
		{#if showPin && task.pinned}<span
				title="Placée à la main : change-la depuis la tâche pour revenir à l’automatique"
				><Pin size={12} /></span
			>{/if}
		{#if task.feature}
			<span class="ml-auto flex min-w-0 items-center gap-1.5 truncate"
				><PriorityDot priority={task.feature.priority} />{task.feature.title}</span
			>
		{/if}
	</span>
	<span class="text-sm leading-snug font-medium {task.done ? 'text-ink-3 line-through' : ''}"
		>{task.title}</span
	>
	{#if task.dueDate || task.minutes || task.assignees.length}
		<span class="flex items-center gap-2">
			{#if task.dueDate}<DueDate date={task.dueDate} tone={task.dueTone} />{/if}
			{#if task.minutes}<span class="font-mono text-2xs text-ink-3"
					>{formatMinutes(task.minutes)}</span
				>{/if}
			<span class="ml-auto"><AvatarStack people={task.assignees} size={20} /></span>
		</span>
	{/if}
</button>
