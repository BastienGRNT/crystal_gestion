<script lang="ts">
	import type { Task } from '$lib/modules/tasks/domain/task';
	import Avatar from '../atoms/Avatar.svelte';
	import DueDate from '../atoms/DueDate.svelte';
	import StatusCheck from '../atoms/StatusCheck.svelte';
	import type { Person } from '../types';

	interface Props {
		task: Task;
		assignee: Person | undefined;
		today: string;
		onopen: () => void;
		oncomplete: () => void;
	}

	let { task, assignee, today, onopen, oncomplete }: Props = $props();
</script>

<div
	role="button"
	tabindex="0"
	onclick={onopen}
	onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onopen())}
	class="group flex min-h-12 cursor-pointer touch-manipulation items-center gap-3 rounded-xl border border-transparent bg-surface px-3 py-2.5 shadow-card transition-colors select-none hover:border-line-strong"
>
	<StatusCheck status={task.status} title={task.title} {oncomplete} size="sm" />
	<p class="min-w-0 flex-1 truncate text-base">{task.title}</p>
	{#if task.blockedReason}
		<span
			class="rounded-md bg-danger-soft px-1.5 py-0.5 text-xs font-semibold text-danger-text"
			title={task.blockedReason}>Bloqué</span
		>
	{/if}
	{#if task.status === 'doing'}
		<span class="rounded-md bg-accent-soft px-1.5 py-0.5 text-xs font-semibold text-accent-text"
			>En cours</span
		>
	{/if}
	{#if task.dueDate}<DueDate date={task.dueDate} {today} />{/if}
	{#if assignee}<Avatar name={assignee.name} color={assignee.color} size="xs" />{/if}
</div>
