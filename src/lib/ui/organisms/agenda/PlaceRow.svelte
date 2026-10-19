<script lang="ts">
	import { CalendarPlus } from '@lucide/svelte';
	import type { TaskKind } from '$lib/modules/tasks/domain/task';
	import DueDate from '$lib/ui/atoms/DueDate.svelte';
	import KindIcon from './KindIcon.svelte';
	import { TASK_DRAG_TYPE } from './geometry';

	interface Props {
		id: string;
		number: number;
		title: string;
		kind: TaskKind;
		critical: boolean;
		dueDate: string | null;
		today: string;
		onopen: () => void;
		onplace: () => void;
	}

	let { id, number, title, kind, critical, dueDate, today, onopen, onplace }: Props = $props();
</script>

<li
	class="flex items-center gap-1 rounded-xl hover:bg-hover"
	draggable="true"
	ondragstart={(event) => {
		event.dataTransfer?.setData(TASK_DRAG_TYPE, id);
		if (event.dataTransfer) event.dataTransfer.effectAllowed = 'copy';
	}}
>
	<button
		type="button"
		onclick={onopen}
		class="flex min-h-11 min-w-0 flex-1 items-center gap-2 px-2 py-1 text-left"
	>
		<KindIcon {kind} {critical} />
		<span class="min-w-0 flex-1">
			<span class="flex items-baseline gap-1.5">
				<span class="shrink-0 font-mono text-sm text-ink-3">#{number}</span>
				<span class="truncate">{title}</span>
			</span>
			{#if dueDate}<DueDate date={dueDate} {today} />{/if}
		</span>
	</button>
	<button
		type="button"
		onclick={onplace}
		class="flex h-10 shrink-0 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-accent-text hover:bg-accent-soft"
		title="Le poser dans ta prochaine dispo libre"
	>
		<CalendarPlus size={15} aria-hidden="true" /> Poser
	</button>
</li>
