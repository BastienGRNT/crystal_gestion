<script lang="ts">
	import { OctagonAlert } from '@lucide/svelte';
	import type { Snippet } from 'svelte';
	import { useApp } from '$lib/client/context';
	import { now } from '$lib/client/now.svelte';
	import type { Task } from '$lib/modules/tasks/domain/task';
	import DueDate from '$lib/ui/atoms/DueDate.svelte';
	import QuadrantTag from '$lib/ui/atoms/QuadrantTag.svelte';
	import ProjectTag from './ProjectTag.svelte';

	let { task, note, buttons }: { task: Task; note?: string; buttons?: Snippet } = $props();
	const { app, overlays } = useApp();
</script>

<li
	class="flex flex-col gap-2 rounded-xl border border-line bg-surface px-4 py-3 shadow-card sm:flex-row sm:items-center"
>
	<button class="min-h-10 min-w-0 flex-1 text-left" onclick={() => overlays.openTask(task.id)}>
		<span class="block text-base font-semibold hover:underline">{task.title}</span>
		<span class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-3">
			<ProjectTag project={app.projects.get(task.projectId)} />
			<QuadrantTag quadrant={task.quadrant} />
			{#if task.dueDate}<DueDate date={task.dueDate} today={now.today} />{/if}
			{#if note}<span>{note}</span>{/if}
		</span>
		{#if task.blockedReason}
			<span class="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-danger-text">
				<OctagonAlert size={14} aria-hidden="true" />
				{task.blockedReason}
			</span>
		{/if}
	</button>
	{#if buttons}<div class="flex flex-wrap gap-2">{@render buttons()}</div>{/if}
</li>
