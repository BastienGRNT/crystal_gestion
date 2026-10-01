<script lang="ts">
	import { Wrench } from '@lucide/svelte';
	import { formatMinutes } from '$lib/modules/time/domain/time-entry';
	import { relativeDueDate } from '$lib/client/format';
	import type { TaskCardView } from '$lib/client/views/task-card';
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
		/** In the board the column already says the status. */
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
		task.dueTone === 'late'
			? 'text-must font-bold'
			: task.dueTone === 'soon'
				? 'text-should font-semibold'
				: ''
	);
</script>

<!-- Title first, one line of metadata under it, the feat underneath. -->
<button
	type="button"
	{draggable}
	{ondragstart}
	{ondragend}
	onclick={onopen}
	class="group relative flex w-full flex-col gap-2.5 overflow-hidden rounded-[14px] border-[1.5px] border-line bg-surface px-3.5 py-3 text-left shadow-card transition hover:border-line-strong hover:shadow-pop {dragging
		? 'opacity-40'
		: ''}"
>
	{#if task.running}<span class="absolute inset-x-0 top-0 h-[3px] prism" title="Chrono en cours"
		></span>{/if}
	{#if task.fix}<span class="flex items-center gap-1 text-xs font-bold text-must"
			><Wrench size={13} />Fix</span
		>{/if}
	<span class="flex items-start gap-2.5">
		{#if withStatus}<span class="mt-0.5"><StatusIcon status={task.status} size={17} /></span>{/if}
		<span class="text-[15px] leading-snug font-semibold {task.done ? 'text-ink-3' : ''}"
			>{task.title}</span
		>
	</span>
	{#if task.feature}<FeatureMark title={task.feature.title} color={task.feature.color} />{/if}
	{#if task.dueDate || task.minutes || task.assignees.length}
		<span class="flex items-center gap-3 text-ui text-ink-3">
			{#if task.dueDate}<span class="whitespace-nowrap {dueColor}"
					>{relativeDueDate(task.dueDate)}</span
				>{/if}
			{#if task.minutes}<span class="whitespace-nowrap">{formatMinutes(task.minutes)}</span>{/if}
			<span class="ml-auto shrink-0"><AvatarStack people={task.assignees} size={24} /></span>
		</span>
	{/if}
</button>
