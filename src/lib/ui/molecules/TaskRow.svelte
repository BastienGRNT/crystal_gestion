<script lang="ts">
	import { Play } from '@lucide/svelte';
	import type { TaskCardView } from '$lib/client/views/task-card';
	import Checkbox from '../atoms/Checkbox.svelte';
	import DueDate from '../atoms/DueDate.svelte';
	import PriorityDot from '../atoms/PriorityDot.svelte';

	interface Props {
		task: TaskCardView;
		ontoggle: (done: boolean) => void;
		onopen: () => void;
		onstart?: () => void;
	}

	let { task, ontoggle, onopen, onstart }: Props = $props();
</script>

<div
	class="group flex min-h-12 items-center gap-3 rounded-lg px-3 transition hover:bg-surface hover:shadow-card"
>
	<Checkbox checked={task.done} label="Terminer {task.title}" onchange={ontoggle} />
	<button
		type="button"
		onclick={onopen}
		class="flex min-w-0 flex-1 items-center gap-2.5 py-2 text-left"
	>
		<span class="truncate text-base {task.done ? 'text-ink-3 line-through' : ''}">{task.title}</span
		>
		{#if task.running}<span
				class="size-2 shrink-0 animate-pulse rounded-full prism"
				title="Chrono en cours"
			></span>{/if}
		<span class="ml-auto flex shrink-0 items-center gap-2.5">
			{#if task.feature}<span class="hidden items-center gap-1.5 text-sm text-ink-2 sm:flex"
					><PriorityDot priority={task.feature.priority} />{task.feature.title}</span
				>{/if}
			{#if task.dueDate}<DueDate date={task.dueDate} tone={task.dueTone} />{/if}
			<span class="w-11 text-right font-mono text-xs text-ink-3">{task.ref}</span>
		</span>
	</button>
	{#if !onstart || task.done || task.running}
		<span class="size-7 shrink-0"></span>
	{:else}
		<button
			type="button"
			onclick={onstart}
			class="flex size-7 items-center justify-center rounded-md text-ink-3 opacity-0 transition group-hover:opacity-100 hover:bg-accent-soft hover:text-accent max-sm:opacity-100"
			aria-label="Lancer {task.title}"
			title="Lancer le chrono"
		>
			<Play size={13} />
		</button>
	{/if}
</div>
