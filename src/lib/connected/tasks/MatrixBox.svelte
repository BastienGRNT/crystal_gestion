<script lang="ts">
	import { useApp } from '$lib/client/context';
	import { dnd } from '$lib/client/dnd.svelte';
	import { BOXES } from '$lib/client/labels';
	import { now } from '$lib/client/now.svelte';
	import type { Project } from '$lib/modules/projects/domain/project';
	import type { Quadrant, Task } from '$lib/modules/tasks/domain/task';
	import DropLine from '$lib/ui/atoms/DropLine.svelte';
	import InlineAdd from '$lib/ui/molecules/InlineAdd.svelte';
	import TaskRow from '$lib/ui/organisms/TaskRow.svelte';
	import { personFilter } from './filter.svelte';
	import { QUICK_HINT, quickAdd } from './quick-add';

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
	// Drop indexes ignore the dragged card, which stays faded at its place meanwhile.
	const visible = $derived(tasks.filter((t) => t.id !== dnd.active?.id));
	const order = $derived(new Map(visible.map((t, i) => [t.id, i])));
</script>

<section
	aria-labelledby="box-{quadrant}"
	class={[
		'flex min-h-64 flex-col rounded-2xl border border-line p-3.5 transition-colors',
		box.soft,
		dnd.over?.zone === quadrant && 'border-accent ring-3 ring-accent-soft'
	]}
>
	<header class="flex items-baseline gap-2 px-1 pb-2.5">
		<span class={['size-2.5 shrink-0 translate-y-[-1px] rounded-full', box.dot]}></span>
		<h2 id="box-{quadrant}" class={['text-lg font-semibold', box.text]}>{box.label}</h2>
		<span class="text-sm font-medium text-ink-3 tabular-nums">{tasks.length || ''}</span>
		<p class="ml-auto hidden truncate text-sm text-ink-3 sm:block" title={box.axes}>{box.hint}</p>
	</header>

	<div {@attach dnd.dropzone(quadrant, ondrop)} class="flex min-h-12 flex-1 flex-col gap-1.5">
		{#each tasks as task (task.id)}
			{@const index = order.get(task.id)}
			{#if index !== undefined && dnd.lineAt(quadrant, index)}<DropLine />{/if}
			<div {@attach dnd.draggable(task.id, quadrant)}>
				<TaskRow
					{task}
					assignee={app.users.get(task.assigneeId)}
					today={now.today}
					onopen={() => overlays.openTask(task.id)}
					oncomplete={() => actions.tasks.complete(task.id)}
				/>
			</div>
		{:else}
			{#if !dnd.active}<p class="px-1 py-2 text-sm text-ink-3">{box.empty}</p>{/if}
		{/each}
		{#if dnd.lineAt(quadrant, visible.length)}<DropLine />{/if}
	</div>

	<div class="mt-1.5">
		<InlineAdd
			label="Ajouter ici"
			hint={QUICK_HINT}
			onadd={(text) =>
				quickAdd(context, text, {
					projectId: project.id,
					quadrant,
					assigneeId: personFilter.value
				})}
		/>
	</div>
</section>
