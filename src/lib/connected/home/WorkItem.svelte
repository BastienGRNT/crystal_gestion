<script lang="ts">
	import { OctagonAlert } from '@lucide/svelte';
	import type { Snippet } from 'svelte';
	import { useApp } from '$lib/client/context';
	import { now } from '$lib/client/now.svelte';
	import type { Task } from '$lib/modules/tasks/domain/task';
	import DueDate from '$lib/ui/atoms/DueDate.svelte';
	import QuadrantTag from '$lib/ui/atoms/QuadrantTag.svelte';

	let { task, buttons, note }: { task: Task; buttons: Snippet; note?: string } = $props();
	const { overlays } = useApp();
	const done = $derived(task.checklist.filter((s) => s.done).length);
</script>

<li
	class="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 shadow-card sm:flex-row sm:items-center"
>
	<button class="min-w-0 flex-1 text-left" onclick={() => overlays.openTask(task.id)}>
		<span class="block text-md font-semibold hover:underline">{task.title}</span>
		<span class="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-3">
			<QuadrantTag quadrant={task.quadrant} />
			{#if task.dueDate}<DueDate date={task.dueDate} today={now.today} />{/if}
			{#if task.checklist.length}<span>{done}/{task.checklist.length} étapes</span>{/if}
			{#if note}<span>{note}</span>{/if}
		</span>
		{#if task.blockedReason}
			<span class="mt-2 flex items-center gap-1.5 text-sm font-medium text-danger-text">
				<OctagonAlert size={14} />
				{task.blockedReason}
			</span>
		{/if}
	</button>
	<div class="flex flex-wrap gap-2">{@render buttons()}</div>
</li>
