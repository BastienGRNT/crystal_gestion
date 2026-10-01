<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Wrench } from '@lucide/svelte';
	import type { TaskCardView } from '$lib/client/views/task-card';
	import type { TaskMenus } from '$lib/client/views/task-menus';
	import type { TaskFields } from '$lib/modules/tasks/domain/task';
	import StatusIcon from '../../../atoms/StatusIcon.svelte';
	import AssigneeCell from './AssigneeCell.svelte';
	import DueCell from './DueCell.svelte';
	import FeatureCell from './FeatureCell.svelte';
	import TimerCell from './TimerCell.svelte';

	interface Props {
		task: TaskCardView;
		menus: TaskMenus;
		/** Off inside a feat: every row is that feat. */
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
	const waiting = $derived(task.status === 'review');
</script>

<!-- Title, then quiet metadata. The title button covers the row; cells sit above it. -->
<div
	class="group relative flex min-h-[52px] items-center gap-3.5 px-5 transition hover:bg-hover max-sm:gap-2.5 max-sm:px-4 max-sm:py-2"
>
	<button
		type="button"
		onclick={() => ontoggle(!task.done)}
		title={task.done ? 'Rouvrir' : waiting ? 'Valider' : 'Cocher'}
		aria-label={task.done ? 'Rouvrir' : waiting ? 'Valider' : 'Cocher'}
		class="relative z-[1] -m-1 rounded-full p-1 transition hover:scale-110"
	>
		<StatusIcon status={task.status} size={21} />
	</button>
	{#if task.fix}<span class="flex shrink-0 items-center gap-1 text-xs font-bold text-must"
			><Wrench size={14} />Fix</span
		>{/if}
	<button
		type="button"
		onclick={onopen}
		class="min-w-0 flex-1 text-left text-[15px] leading-snug after:absolute after:inset-0 after:content-[''] max-sm:line-clamp-2 sm:truncate {task.done
			? 'text-ink-3 line-through decoration-ink-3/40'
			: ''}">{task.title}</button
	>
	{#if waiting}<span class="shrink-0 text-xs font-bold text-accent-text max-sm:hidden"
			>À valider</span
		>{/if}
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
