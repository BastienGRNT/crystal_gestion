<script lang="ts">
	import { Check, Eye, RotateCcw } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { firstName } from '$lib/client/format';
	import { myWork, questionsForMe } from '$lib/client/views/today';
	import type { Project } from '$lib/modules/projects/domain/project';
	import type { Task } from '$lib/modules/tasks/domain/task';
	import Button from '$lib/ui/atoms/Button.svelte';
	import QuestionCard from '../home/QuestionCard.svelte';
	import BlockButton from '../tasks/BlockButton.svelte';
	import ProjectTag from './ProjectTag.svelte';
	import TaskLine from './TaskLine.svelte';

	let { projects, tasks }: { projects: Project[]; tasks: Task[] } = $props();
	const { app, actions } = useApp();
	const work = $derived(myWork(tasks, app.meId));
	const questions = $derived(questionsForMe(app.questions.all, projects, app.meId));
	const nothing = $derived(!work.doing.length && !work.toReview.length && !questions.length);
	const author = (id: string | null) => (id ? firstName(app.users.get(id)?.name ?? '') : '');
</script>

<section aria-labelledby="for-me" class="flex flex-col gap-3">
	<h2 id="for-me" class="text-lg font-semibold tracking-tight">Pour toi, maintenant</h2>

	{#if work.doing.length}
		<ul class="flex flex-col gap-2">
			{#each work.doing as task (task.id)}
				<TaskLine {task} note="En cours">
					{#snippet buttons()}
						<Button
							size="sm"
							variant="primary"
							icon={Check}
							onclick={() => actions.tasks.complete(task.id)}>Terminé</Button
						>
						<Button size="sm" icon={Eye} onclick={() => actions.tasks.askReview(task.id)}
							>À relire</Button
						>
						<BlockButton {task} />
					{/snippet}
				</TaskLine>
			{/each}
		</ul>
	{/if}

	{#if work.toReview.length}
		<p class="mt-1 text-sm font-semibold text-ink-2">On te demande de relire</p>
		<ul class="flex flex-col gap-2">
			{#each work.toReview as task (task.id)}
				<TaskLine {task} note={task.assigneeId ? `par ${author(task.assigneeId)}` : undefined}>
					{#snippet buttons()}
						<Button
							size="sm"
							variant="primary"
							icon={Check}
							onclick={() => actions.tasks.complete(task.id)}>C’est bon</Button
						>
						<Button
							size="sm"
							icon={RotateCcw}
							onclick={() => actions.tasks.update(task.id, { status: 'doing' })}>À reprendre</Button
						>
					{/snippet}
				</TaskLine>
			{/each}
		</ul>
	{/if}

	{#if questions.length}
		<p class="mt-1 text-sm font-semibold text-ink-2">On attend ta réponse</p>
		<div class="flex flex-col gap-3">
			{#each questions as question (question.id)}
				{@const project = app.projects.get(question.projectId)}
				{#if project}
					<div class="flex flex-col gap-1.5">
						<ProjectTag {project} />
						<QuestionCard {question} {project} />
					</div>
				{/if}
			{/each}
		</div>
	{/if}

	{#if nothing}
		<p class="rounded-xl border border-dashed border-line-strong px-4 py-4 text-base text-ink-3">
			Rien en cours, rien à relire, personne n’attend ta réponse. Choisis ta prochaine tâche juste
			en dessous.
		</p>
	{/if}
</section>
