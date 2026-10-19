<script lang="ts">
	import { useApp } from '$lib/client/context';
	import { positionAt } from '$lib/modules/tasks/domain/position';
	import type { Project } from '$lib/modules/projects/domain/project';
	import type { Quadrant } from '$lib/modules/tasks/domain/task';
	import { matrixOf, type MatrixBox as Box } from '$lib/modules/tasks/domain/views';
	import { projectTasks } from '../projects/current.svelte';
	import { personFilter } from './filter.svelte';
	import InboxStrip from './InboxStrip.svelte';
	import MatrixBox from './MatrixBox.svelte';
	import { stepFilter } from './step-filter.svelte';

	let { project }: { project: Project } = $props();
	const { app, actions } = useApp();

	const matrix = $derived(
		matrixOf(
			stepFilter.view(app, project.id).apply(personFilter.apply(projectTasks(app, project.id)))
		)
	);

	/** Drops keep the order the person chose, in the box they chose. */
	const dropInto = (box: Box) => (taskId: string, index: number) => {
		const others = matrix[box].filter((t) => t.id !== taskId).map((t) => t.position);
		actions.tasks.update(taskId, {
			quadrant: box === 'inbox' ? null : box,
			position: positionAt(others, index)
		});
	};

	const sortInto = (taskId: string, quadrant: Quadrant) =>
		dropInto(quadrant)(taskId, matrix[quadrant].length);
</script>

<div class="flex flex-col gap-4">
	{#if matrix.inbox.length}
		<InboxStrip
			tasks={matrix.inbox}
			ondrop={dropInto('inbox')}
			onsort={(task, q) => sortInto(task.id, q)}
		/>
	{/if}

	<div data-drop-gaps class="grid gap-3 md:grid-cols-[auto_1fr_1fr] md:grid-rows-[auto_1fr_1fr]">
		<div class="hidden md:block"></div>
		<p class="hidden text-center text-sm font-semibold tracking-wide text-ink-3 uppercase md:block">
			Urgent
		</p>
		<p class="hidden text-center text-sm font-semibold tracking-wide text-ink-3 uppercase md:block">
			Pas urgent
		</p>

		<p
			class="hidden items-center text-sm font-semibold tracking-wide text-ink-3 uppercase [writing-mode:vertical-rl] md:flex md:rotate-180 md:justify-center"
		>
			Important
		</p>
		<MatrixBox quadrant="now" tasks={matrix.now} {project} ondrop={dropInto('now')} />
		<MatrixBox quadrant="plan" tasks={matrix.plan} {project} ondrop={dropInto('plan')} />

		<p
			class="hidden items-center text-sm font-semibold tracking-wide text-ink-3 uppercase [writing-mode:vertical-rl] md:flex md:rotate-180 md:justify-center"
		>
			Moins important
		</p>
		<MatrixBox
			quadrant="delegate"
			tasks={matrix.delegate}
			{project}
			ondrop={dropInto('delegate')}
		/>
		<MatrixBox quadrant="later" tasks={matrix.later} {project} ondrop={dropInto('later')} />
	</div>
</div>
