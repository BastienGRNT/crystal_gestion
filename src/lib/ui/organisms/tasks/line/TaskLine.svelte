<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { TaskCardView } from '$lib/client/views/task-card';
	import type { TaskMenus } from '$lib/client/views/task-menus';
	import type { TaskFields } from '$lib/modules/tasks/domain/task';
	import BugMark from '../../../atoms/BugMark.svelte';
	import StatusIcon from '../../../atoms/StatusIcon.svelte';
	import AssigneeCell from './AssigneeCell.svelte';
	import DueCell from './DueCell.svelte';
	import FeatureCell from './FeatureCell.svelte';
	import TimerCell from './TimerCell.svelte';

	interface Props {
		task: TaskCardView;
		menus: TaskMenus;
		/** Off inside a feature: every row is that feature. */
		withFeature?: boolean;
		/** Off on the home page: they are all yours. */
		withPeople?: boolean;
		extra?: Snippet;
		ontoggle: (done: boolean) => void;
		onopen: () => void;
		ontimer: () => void;
		onchange: (changes: Partial<TaskFields>) => void;
	}

	let {
		task,
		menus,
		withFeature = true,
		withPeople = true,
		extra,
		ontoggle,
		onopen,
		ontimer,
		onchange
	}: Props = $props();
	const toggleAssignee = (id: string) => {
		const ids = task.assignees.map((a) => a.id);
		onchange({ assigneeIds: ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id] });
	};
</script>

<!-- Title, then quiet metadata. The title button covers the row; cells sit above it. -->
<div class="group relative flex min-h-10 items-center gap-2.5 rounded-lg pr-1 pl-2 hover:bg-hover">
	<button
		type="button"
		onclick={() => ontoggle(!task.done)}
		title={task.done ? 'Rouvrir' : 'Marquer comme fait'}
		aria-label={task.done ? 'Rouvrir' : 'Marquer comme fait'}
		class="relative z-[1] -m-1 rounded-full p-1 transition hover:scale-110"
	>
		<StatusIcon status={task.status} />
	</button>
	{#if task.fix}<BugMark size={13} />{/if}
	<button
		type="button"
		onclick={onopen}
		class="min-w-0 flex-1 truncate text-left text-sm after:absolute after:inset-0 after:content-[''] {task.done
			? 'text-ink-3 line-through'
			: ''}">{task.title}</button
	>
	{@render extra?.()}
	<TimerCell running={task.running} {ontimer} />
	{#if withFeature}
		<FeatureCell
			feature={task.feature}
			options={menus.feature}
			onpick={(featureId) => onchange({ featureId })}
		/>
	{/if}
	<DueCell
		dueDate={task.dueDate}
		tone={task.dueTone}
		options={menus.due}
		onpick={(dueDate) => onchange({ dueDate })}
	/>
	{#if withPeople}
		<AssigneeCell assignees={task.assignees} options={menus.people} ontoggle={toggleAssignee} />
	{/if}
</div>
