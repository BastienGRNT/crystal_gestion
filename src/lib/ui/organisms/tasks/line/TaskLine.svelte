<script lang="ts">
	import type { TaskCardView } from '$lib/client/views/task-card';
	import type { TaskMenus } from '$lib/client/views/task-menus';
	import type { TaskFields, TaskStatus } from '$lib/modules/tasks/domain/task';
	import BugMark from '../../../atoms/BugMark.svelte';
	import Checkbox from '../../../atoms/Checkbox.svelte';
	import AssigneeCell from './AssigneeCell.svelte';
	import DueCell from './DueCell.svelte';
	import FeatureCell from './FeatureCell.svelte';
	import StatusCell from './StatusCell.svelte';
	import TimerCell from './TimerCell.svelte';

	interface Props {
		task: TaskCardView;
		menus: TaskMenus;
		/** Home shows a lighter row: no ref, status nor assignees (they are all yours). */
		compact?: boolean;
		/** Off inside a feature page: every row is that feature. */
		withFeature?: boolean;
		ontoggle: (done: boolean) => void;
		onopen: () => void;
		ontimer: () => void;
		onstatus: (status: TaskStatus) => void;
		onchange: (changes: Partial<TaskFields>) => void;
	}

	let {
		task,
		menus,
		compact = false,
		withFeature = true,
		ontoggle,
		onopen,
		ontimer,
		onstatus,
		onchange
	}: Props = $props();
	const toggleAssignee = (id: string) => {
		const ids = task.assignees.map((a) => a.id);
		onchange({ assigneeIds: ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id] });
	};
</script>

<!-- The title button stretches over the row; the cells sit above it and open their own menu. -->
<div
	class="group relative flex min-h-11 items-center gap-2 rounded-lg pr-1.5 pl-2.5 transition hover:bg-hover"
>
	<span class="relative"
		><Checkbox checked={task.done} label="Marquer comme fait" onchange={ontoggle} /></span
	>
	{#if !compact}<span class="w-11 shrink-0 font-mono text-2xs text-ink-3">{task.ref}</span>{/if}
	{#if task.fix}<BugMark />{/if}
	<button
		type="button"
		onclick={onopen}
		class="min-w-0 flex-1 truncate text-left after:absolute after:inset-0 after:content-[''] {task.done
			? 'text-ink-3 line-through'
			: ''}">{task.title}</button
	>
	{#if task.running}<span
			class="size-1.5 shrink-0 animate-pulse rounded-full bg-must"
			title="Chrono en cours"
		></span>{/if}
	{#if withFeature}
		<FeatureCell
			feature={task.feature}
			options={menus.feature}
			onpick={(featureId) => onchange({ featureId })}
			width={compact ? 'w-[150px]' : 'w-[160px]'}
		/>
	{/if}
	{#if !compact}
		<StatusCell status={task.status} options={menus.status} onpick={onstatus} />
		<AssigneeCell assignees={task.assignees} options={menus.people} ontoggle={toggleAssignee} />
	{/if}
	<DueCell
		dueDate={task.dueDate}
		tone={task.dueTone}
		options={menus.due}
		onpick={(dueDate) => onchange({ dueDate })}
	/>
	<TimerCell running={task.running} {ontimer} />
</div>
