<script lang="ts">
	import { CirclePlay, Plus } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { nextByProject } from '$lib/client/views/today';
	import type { Project } from '$lib/modules/projects/domain/project';
	import type { Task } from '$lib/modules/tasks/domain/task';
	import { doingCount, WIP_PER_PERSON } from '$lib/modules/tasks/domain/views';
	import Button from '$lib/ui/atoms/Button.svelte';
	import TaskLine from './TaskLine.svelte';

	let { projects, tasks }: { projects: Project[]; tasks: Task[] } = $props();
	const { app, actions, overlays } = useApp();
	const picks = $derived(nextByProject(projects, tasks, app.milestones.all, app.meId));
	// The project home's rule: two tasks under way in a project, finish one first.
	const full = (projectId: string) =>
		doingCount(
			tasks.filter((t) => t.projectId === projectId),
			app.meId
		) >= WIP_PER_PERSON;
</script>

<section aria-labelledby="next-up" class="flex flex-col gap-3">
	<h2 id="next-up" class="text-lg font-semibold tracking-tight">Ta prochaine tâche, par projet</h2>
	{#if picks.length}
		<ul class="flex flex-col gap-2">
			{#each picks as { project, task } (project.id)}
				{#if full(project.id)}
					<TaskLine {task} note="Finis d’abord une de tes deux tâches en cours ici" />
				{:else}
					<TaskLine {task} note={task.assigneeId ? undefined : 'Personne dessus'}>
						{#snippet buttons()}
							<Button
								size="sm"
								variant="primary"
								icon={CirclePlay}
								onclick={() => actions.tasks.start(task.id)}>Je m’y mets</Button
							>
						{/snippet}
					</TaskLine>
				{/if}
			{/each}
		</ul>
	{:else}
		<div
			class="flex flex-col items-start gap-3 rounded-xl border border-dashed border-line-strong px-4 py-4"
		>
			<p class="text-base text-ink-3">
				Rien à prendre dans tes projets : tout est pris, bloqué, ou pas encore écrit.
			</p>
			<Button icon={Plus} onclick={() => overlays.newTask()}>Nouvelle tâche</Button>
		</div>
	{/if}
</section>
