<script lang="ts">
	import { CheckCheck, MessageCircleQuestion } from '@lucide/svelte';
	import { slide } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { useApp } from '$lib/client/context';
	import { motion } from '$lib/client/dnd.svelte';
	import { firstName, momentLabel, plural, relativeTime } from '$lib/client/format';
	import { now } from '$lib/client/now.svelte';
	import { notificationVerb, subjectHref } from '$lib/client/views/activity-text';
	import {
		missedChannels,
		pendingNotifications,
		teamProgress,
		type Progress
	} from '$lib/client/views/catch-up';
	import { askedOfMe } from '$lib/client/views/questions';
	import { catchUpSince, type Notification } from '$lib/modules/activity/domain/activity';
	import type { Subject } from '$lib/modules/kernel/domain/subject';
	import { memberId } from '$lib/modules/projects/domain/membership';
	import type { Project } from '$lib/modules/projects/domain/project';
	import Avatar from '$lib/ui/atoms/Avatar.svelte';
	import Button from '$lib/ui/atoms/Button.svelte';
	import MissedChannel from './MissedChannel.svelte';
	import QuestionCard from './QuestionCard.svelte';

	let { project }: { project: Project } = $props();
	const { app, actions, overlays } = useApp();

	const since = $derived(
		catchUpSince(
			app.visits.get(project.id)?.seenAt ?? null,
			app.members.get(memberId(project.id, app.meId))?.joinedAt ?? null,
			now.value
		)
	);
	const missed = $derived(
		missedChannels(app.channels.all, (id) => app.channelStates.get(id), project.id)
	);
	const forMe = $derived(
		pendingNotifications(
			app.notifications.all,
			project.id,
			new Set(missed.map((m) => m.channel.id))
		)
	);
	const progress = $derived(
		teamProgress(
			app.activities.all.filter((a) => a.projectId === project.id),
			since,
			app.meId
		)
	);
	// Not news but debts: they stay after "Tout est vu", until answered.
	const questions = $derived(askedOfMe(app.questions.all, app.meId, project.id));
	const news = $derived(missed.length + forMe.length + progress.length > 0);
	const anything = $derived(news || questions.length > 0);
	const base = $derived(`/p/${project.slug}`);

	function openSubject(subject: Subject) {
		if (subject.kind === 'task') overlays.openTask(subject.id);
		else void goto(subjectHref(subject, project.slug));
	}

	function openNotification(n: Notification) {
		actions.people.markNotificationsRead([n.id]);
		openSubject(n.subject);
	}

	const caughtUp = () =>
		actions.people.caughtUp(
			project.id,
			missed.map((m) => m.channel.id),
			actions.chat.markRead
		);

	const TASK_LINES: { key: 'done' | 'review' | 'started' | 'blocked'; verb: string }[] = [
		{ key: 'done', verb: 'a terminé' },
		{ key: 'review', verb: 'a envoyé en revue' },
		{ key: 'started', verb: 'a commencé' },
		{ key: 'blocked', verb: 'est bloqué·e sur' }
	];
	const SHOWN = 4;
</script>

{#snippet subjects(list: Subject[])}
	{#each list.slice(0, SHOWN) as subject, i (subject.id)}{i ? ', ' : ' '}<button
			class="text-left font-medium text-ink hover:text-accent-text hover:underline"
			onclick={() => openSubject(subject)}>« {subject.title} »</button
		>{/each}{#if list.length > SHOWN}<span class="text-ink-3">
			et {list.length - SHOWN} autres</span
		>{/if}
{/snippet}

{#snippet person(p: Progress)}
	{@const actor = app.users.get(p.actorId)}
	<li class="flex gap-3">
		{#if actor}<Avatar name={actor.name} color={actor.color} size="md" />{/if}
		<div class="min-w-0 flex-1">
			<p class="text-base font-semibold">{firstName(actor?.name ?? 'Quelqu’un')}</p>
			<ul class="mt-0.5 flex flex-col gap-0.5 text-base text-ink-2">
				{#if p.joined}<li>a rejoint le projet</li>{/if}
				{#if p.closed.length}<li>a clos l’étape{@render subjects(p.closed)}</li>{/if}
				{#if p.decisions.length}<li>a noté{@render subjects(p.decisions)}</li>{/if}
				{#each TASK_LINES as line (line.key)}
					{#if p[line.key].length}<li>{line.verb}{@render subjects(p[line.key])}</li>{/if}
				{/each}
				{#if p.created}<li>
						a ajouté {plural(p.created, 'tâche')} ·
						<a href="{base}/tableau" class="font-medium text-accent-text hover:underline">voir</a>
					</li>{/if}
				{#if p.files}<li>
						a déposé {plural(p.files, 'fichier')} ·
						<a href="{base}/documents" class="font-medium text-accent-text hover:underline">voir</a>
					</li>{/if}
				{#if p.vault}<li>
						a ajouté {plural(p.vault, 'accès', 'accès')} ·
						<a href="{base}/acces" class="font-medium text-accent-text hover:underline">voir</a>
					</li>{/if}
				{#if p.channels.length}<li>a ouvert{@render subjects(p.channels)}</li>{/if}
			</ul>
		</div>
	</li>
{/snippet}

<section aria-labelledby="catch-up" class="flex flex-col gap-4">
	<header class="flex flex-wrap items-center gap-x-3 gap-y-1">
		<h2 id="catch-up" class="text-lg font-semibold tracking-tight">À rattraper</h2>
		<p class="text-sm text-ink-3">
			{app.visits.get(project.id) ? 'depuis ton dernier passage,' : 'depuis ton arrivée,'}
			{momentLabel(since, now.value)}
		</p>
		{#if news}
			<Button size="sm" icon={CheckCheck} class="ml-auto" onclick={caughtUp}>Tout est vu</Button>
		{/if}
	</header>

	{#if !anything}
		<p
			class="flex items-center gap-2.5 rounded-xl border border-line bg-surface px-4 py-3.5 text-base text-ink-2"
		>
			<CheckCheck size={18} class="shrink-0 text-ok-text" />
			Tu es à jour : pas de message manqué, rien de neuf dans l’équipe.
		</p>
	{:else}
		<div class="grid gap-4 xl:grid-cols-2">
			{#if questions.length || forMe.length || missed.length}
				<div class="flex flex-col gap-3">
					{#if questions.length}
						<h3 class="flex items-center gap-1.5 text-sm font-semibold text-warn-text">
							<MessageCircleQuestion size={15} aria-hidden="true" />
							On attend ta réponse
						</h3>
						{#each questions as question (question.id)}
							<div transition:slide={{ duration: motion(160) }}>
								<QuestionCard {question} {project} />
							</div>
						{/each}
					{/if}
					{#if forMe.length}
						<ul
							class="divide-y divide-line overflow-hidden rounded-xl border border-accent/40 bg-surface shadow-card"
						>
							{#each forMe as n (n.id)}
								{@const actor = app.users.get(n.actorId)}
								<li transition:slide={{ duration: motion(160) }}>
									<button
										onclick={() => openNotification(n)}
										class="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-surface-2"
									>
										{#if actor}<Avatar name={actor.name} color={actor.color} size="md" />{/if}
										<span class="min-w-0 flex-1 text-base">
											<span class="font-semibold">{firstName(actor?.name ?? 'Quelqu’un')}</span>
											{notificationVerb(n)}
											<span class="font-medium">« {n.subject.title} »</span>
											<span class="block text-sm text-ink-3"
												>{relativeTime(n.createdAt, now.value)}</span
											>
										</span>
										<span class="mt-2 size-2.5 shrink-0 rounded-full bg-accent" aria-label="Nouveau"
										></span>
									</button>
								</li>
							{/each}
						</ul>
					{/if}
					{#if missed.length}
						<div class="flex flex-col gap-3">
							{#each missed as { channel, state } (channel.id)}
								<div transition:slide={{ duration: motion(160) }}>
									<MissedChannel {channel} status={state} {project} />
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/if}
			{#if progress.length}
				<div class="flex flex-col gap-2">
					<h3 class="text-sm font-semibold text-ink-2">Pendant ce temps</h3>
					<ul class="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4 shadow-card">
						{#each progress as p (p.actorId)}{@render person(p)}{/each}
					</ul>
				</div>
			{/if}
		</div>
	{/if}
</section>
