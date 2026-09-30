<script lang="ts">
	import { formatMinutes } from '$lib/modules/time/domain/time-entry';
	import type { TaskCardView } from '$lib/client/views/task-card';
	import DueDate from '../atoms/DueDate.svelte';
	import PriorityDot from '../atoms/PriorityDot.svelte';
	import AvatarStack from './AvatarStack.svelte';

	interface Props {
		task: TaskCardView;
		onopen: () => void;
		draggable?: boolean;
		ondragstart?: (event: DragEvent) => void;
		ondragend?: () => void;
		dragging?: boolean;
	}

	let {
		task,
		onopen,
		draggable = false,
		ondragstart,
		ondragend,
		dragging = false
	}: Props = $props();
</script>

<button
	type="button"
	{draggable}
	{ondragstart}
	{ondragend}
	onclick={onopen}
	class="group relative flex w-full flex-col gap-2 overflow-hidden rounded-lg border border-line bg-surface p-3 text-left shadow-[0_1px_0_rgb(0_0_0/0.03)] transition hover:border-line-strong hover:shadow-pop {dragging
		? 'opacity-40'
		: ''}"
>
	{#if task.running}<span class="absolute inset-x-0 top-0 h-[2px] prism" title="Chrono en cours"
		></span>{/if}
	<span class="flex items-center gap-2 text-xs text-ink-3">
		<span class="font-mono">{task.ref}</span>
		{#if task.feature}
			<span class="ml-auto flex min-w-0 items-center gap-1.5 truncate"
				><PriorityDot priority={task.feature.priority} />{task.feature.title}</span
			>
		{/if}
	</span>
	<span class="text-base leading-snug font-medium {task.done ? 'text-ink-3 line-through' : ''}"
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
