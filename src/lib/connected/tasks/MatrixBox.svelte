<script lang="ts">
	import { useApp } from '$lib/client/context';
	import { dnd, reflow } from '$lib/client/dnd.svelte';
	import { BOXES } from '$lib/client/labels';
	import { now } from '$lib/client/now.svelte';
	import type { Project } from '$lib/modules/projects/domain/project';
	import type { Quadrant, Task } from '$lib/modules/tasks/domain/task';
	import DropSlot from '$lib/ui/atoms/DropSlot.svelte';
	import InlineAdd from '$lib/ui/molecules/InlineAdd.svelte';
	import TaskRow from '$lib/ui/organisms/TaskRow.svelte';
	import { personFilter } from './filter.svelte';
	import { QUICK_HINT, quickAdd } from './quick-add';
	import { stepFilter } from './step-filter.svelte';

	interface Props {
		quadrant: Quadrant;
		tasks: Task[];
		project: Project;
		ondrop: (taskId: string, index: number) => void;
	}

	let { quadrant, tasks, project, ondrop }: Props = $props();
	const context = useApp();
	const { app, actions, overlays } = context;
	const box = $derived(BOXES[quadrant]);
	const rows = $derived(dnd.rows(quadrant, tasks));
	const empty = $derived(!tasks.some((t) => t.id !== dnd.active?.id) && !dnd.isOver(quadrant));
</script>

<section
	data-drop-area
	aria-labelledby="box-{quadrant}"
	class={[
		'flex min-h-64 flex-col rounded-2xl border border-line p-3.5 transition-colors',
		box.soft,
		dnd.isOver(quadrant) && 'border-accent'
	]}
>
	<header class="flex items-baseline gap-2 px-1 pb-2.5">
		<span class={['size-2.5 shrink-0 translate-y-[-1px] rounded-full', box.dot]}></span>
		<h2 id="box-{quadrant}" class={['text-lg font-semibold', box.text]}>{box.label}</h2>
		<span class="text-sm font-medium text-ink-3 tabular-nums">{tasks.length || ''}</span>
		<p class="ml-auto hidden truncate text-sm text-ink-3 sm:block" title={box.axes}>{box.hint}</p>
	</header>

	<div
		{@attach dnd.dropzone(quadrant, ondrop)}
		class="relative flex min-h-12 flex-1 flex-col gap-1.5"
	>
		{#each rows as row (row.key)}
			<div animate:reflow {@attach row.item && dnd.draggable(row.item.id, quadrant)}>
				{#if row.item}
					{@const task = row.item}
					<TaskRow
						{task}
						assignee={app.users.get(task.assigneeId)}
						today={now.today}
						onopen={() => overlays.openTask(task.id)}
						oncomplete={() => actions.tasks.complete(task.id)}
					/>
				{:else}
					<DropSlot height={dnd.active?.height ?? 0} />
				{/if}
			</div>
		{/each}
		{#if empty}<p class="px-1 py-2 text-sm text-ink-3">{box.empty}</p>{/if}
	</div>

	<div class="mt-1.5">
		<InlineAdd
			label="Ajouter ici"
			hint={QUICK_HINT}
			onadd={(text) =>
				quickAdd(
					context,
					text,
					{
						projectId: project.id,
						quadrant,
						assigneeId: personFilter.value,
						milestoneId: stepFilter.view(app, project.id).newTaskStep
					},
					true
				)}
		/>
	</div>
</section>
