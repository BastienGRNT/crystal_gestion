<script lang="ts">
	import { relativeDueDate } from '$lib/client/format';
	import type { TaskCardView } from '$lib/client/views/task-card';
	import BugMark from '../../atoms/BugMark.svelte';
	import StatusIcon from '../../atoms/StatusIcon.svelte';

	interface Props {
		task: TaskCardView;
		dragging: boolean;
		ondragstart: () => void;
		ondragend: () => void;
		onopen: () => void;
		ontoggle: () => void;
	}

	let { task, dragging, ondragstart, ondragend, onopen, ontoggle }: Props = $props();
	const due = $derived(
		task.dueTone === 'late' ? 'text-must font-medium' : task.dueTone === 'soon' ? 'text-should' : ''
	);
</script>

<div
	draggable="true"
	role="listitem"
	ondragstart={(event) => (event.dataTransfer?.setData('text/plain', task.id), ondragstart())}
	{ondragend}
	class="group relative flex h-9 cursor-grab items-center gap-2 rounded-lg bg-surface px-2 shadow-card transition hover:shadow-pop active:cursor-grabbing {dragging
		? 'opacity-40'
		: ''}"
>
	<button
		type="button"
		onclick={ontoggle}
		aria-label="Marquer comme fait"
		class="relative z-[1] rounded-full p-0.5 hover:scale-110"
		><StatusIcon status={task.status} size={15} /></button
	>
	{#if task.fix}<BugMark size={12} />{/if}
	<button
		type="button"
		onclick={onopen}
		class="min-w-0 flex-1 truncate text-left text-ui after:absolute after:inset-0"
		>{task.title}</button
	>
	{#if task.feature}<span
			class="size-2 shrink-0 rounded-[3px]"
			style="background:{task.feature.color}"
			title={task.feature.title}
		></span>{/if}
	{#if task.dueDate}<span class="shrink-0 text-xs whitespace-nowrap text-ink-3 {due}"
			>{relativeDueDate(task.dueDate)}</span
		>{/if}
</div>
