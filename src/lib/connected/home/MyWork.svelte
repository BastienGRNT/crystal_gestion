<script lang="ts">
	import {
		Check,
		CirclePlay,
		Eye,
		MessageCircleQuestion,
		RotateCcw,
		Shuffle
	} from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { useApp } from '$lib/client/context';
	import { elapsed, firstName, joinNames } from '$lib/client/format';
	import { toDisplay } from '$lib/client/mentions';
	import { now } from '$lib/client/now.svelte';
	import { plainText } from '$lib/client/rich-text';
	import { nextTasks } from '$lib/client/views/next-task';
	import { currentStepIds } from '$lib/client/views/roadmap';
	import { askedByMe } from '$lib/client/views/questions';
	import type { Message } from '$lib/modules/chat/domain/chat';
	import { doingCount, WIP_PER_PERSON } from '$lib/modules/tasks/domain/views';
	import type { Project } from '$lib/modules/projects/domain/project';
	import Button from '$lib/ui/atoms/Button.svelte';
	import { projectTasks } from '../projects/current.svelte';
	import BlockButton from '../tasks/BlockButton.svelte';
	import WorkItem from './WorkItem.svelte';

	let { project }: { project: Project } = $props();
	const { app, actions, overlays } = useApp();
	const tasks = $derived(projectTasks(app, project.id));
	const doing = $derived(tasks.filter((t) => t.status === 'doing' && t.assigneeId === app.meId));
	const toReview = $derived(
		tasks.filter((t) => t.status === 'review' && t.reviewerId === app.meId)
	);
	const waitingReview = $derived(
		tasks.filter((t) => t.status === 'review' && t.assigneeId === app.meId)
	);
	const next = $derived(nextTasks(tasks, app.meId, currentStepIds(app.milestones.all, project.id)));
	let skip = $state(0);
	const suggestion = $derived(next.length ? next[skip % next.length] : null);
	const full = $derived(doingCount(tasks, app.meId) >= WIP_PER_PERSON);
	const reviewer = (id: string | null) => (id ? firstName(app.users.get(id)?.name ?? '') : null);
	const asked = $derived(askedByMe(app.questions.all, app.meId, project.id));
	// The name is already in front of it: the "@Camille" inside would say it twice.
	const gist = (question: Message) =>
		plainText(toDisplay(question.body.replace(/<@[0-9a-f-]{36}>\s*/g, ''), app.users.all));

	function openQuestion(question: Message) {
		const taskId = app.channels.get(question.channelId)?.taskId;
		if (taskId) overlays.openTask(taskId);
		else void goto(`/p/${project.slug}/discussion/${question.channelId}?message=${question.id}`);
	}
</script>

<section aria-labelledby="my-work" class="flex flex-col gap-3">
	<h2 id="my-work" class="text-lg font-semibold tracking-tight">Pour toi, maintenant</h2>

	{#if doing.length}
		<ul class="flex flex-col gap-2">
			{#each doing as task (task.id)}
				<WorkItem {task} note="En cours">
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
				</WorkItem>
			{/each}
		</ul>
	{/if}

	{#if toReview.length}
		<p class="mt-1 text-sm font-semibold text-ink-2">On te demande de relire</p>
		<ul class="flex flex-col gap-2">
			{#each toReview as task (task.id)}
				<WorkItem {task} note={task.assigneeId ? `par ${reviewer(task.assigneeId)}` : undefined}>
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
				</WorkItem>
			{/each}
		</ul>
	{/if}

	{#if !doing.length || !full}
		{#if suggestion}
			<p class="mt-1 text-sm font-semibold text-ink-2">
				{doing.length ? 'Et ensuite' : 'Ta prochaine tâche'}
			</p>
			<ul>
				<WorkItem task={suggestion} note={suggestion.assigneeId ? undefined : 'Personne dessus'}>
					{#snippet buttons()}
						<Button
							size="sm"
							variant="primary"
							icon={CirclePlay}
							onclick={() => actions.tasks.start(suggestion.id)}>Je m’y mets</Button
						>
						{#if next.length > 1}<Button
								size="sm"
								variant="ghost"
								icon={Shuffle}
								onclick={() => skip++}>Une autre</Button
							>{/if}
					{/snippet}
				</WorkItem>
			</ul>
		{:else if !doing.length && !toReview.length}
			<p class="rounded-xl border border-dashed border-line-strong px-4 py-5 text-base text-ink-3">
				Rien pour toi à faire en ce moment. Ajoute une tâche avec <span class="font-semibold"
					>N</span
				>, ou va voir le
				<a href="/p/{project.slug}/tableau" class="font-medium text-accent-text hover:underline"
					>tableau</a
				>.
			</p>
		{/if}
	{:else}
		<p class="text-sm text-ink-3">
			Deux tâches en cours : finis-en une avant d’en commencer une autre.
		</p>
	{/if}

	{#if asked.length}
		<div class="flex flex-col gap-1">
			<p class="flex items-center gap-1.5 text-sm text-ink-3">
				<MessageCircleQuestion size={14} aria-hidden="true" />Tu attends une réponse
			</p>
			<ul class="flex flex-col">
				{#each asked as question (question.id)}
					<li class="flex min-h-10 items-center gap-2 text-sm">
						<span class="shrink-0 font-semibold text-ink-2"
							>{joinNames(
								question.asks.map((id) => firstName(app.users.get(id)?.name ?? ''))
							)}</span
						>
						<button
							class="min-w-0 flex-1 truncate text-left text-ink-2 hover:text-ink hover:underline"
							onclick={() => openQuestion(question)}>« {gist(question)} »</button
						>
						<span class="shrink-0 text-ink-3">{elapsed(question.createdAt, now.value)}</span>
						<button
							class="shrink-0 rounded-md px-2 py-1 text-ink-3 hover:bg-hover hover:text-ink"
							onclick={() => actions.chat.resolve(question)}>Clore</button
						>
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	{#if waitingReview.length}
		<p class="text-sm text-ink-3">
			En attente de relecture :
			{#each waitingReview as task, i (task.id)}{i ? ', ' : ''}« {task.title} »{task.reviewerId
					? ` (${reviewer(task.reviewerId)})`
					: ''}{/each}
		</p>
	{/if}
</section>
