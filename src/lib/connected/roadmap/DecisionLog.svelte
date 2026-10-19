<script lang="ts">
	import { Ellipsis, Gavel, Plus, Replace, Search, Trash2 } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { firstName, shortDay } from '$lib/client/format';
	import { score } from '$lib/client/views/search';
	import { canWithdraw, supersededIds, type Decision } from '$lib/modules/roadmap/domain/decision';
	import type { Project } from '$lib/modules/projects/domain/project';
	import Button from '$lib/ui/atoms/Button.svelte';
	import IconButton from '$lib/ui/atoms/IconButton.svelte';
	import Menu from '$lib/ui/molecules/Menu.svelte';
	import type { MenuItem } from '$lib/ui/types';

	let { project }: { project: Project } = $props();
	const { app, actions, overlays } = useApp();
	let query = $state('');

	const all = $derived(
		app.decisions.all
			.filter((d) => d.projectId === project.id)
			.sort((a, b) => b.decidedAt.localeCompare(a.decidedAt))
	);
	const replaced = $derived(supersededIds(all));
	const shown = $derived(
		query ? all.filter((d) => score(`${d.text} ${d.why}`, query) !== null) : all
	);

	/** Where it came from, so the context is one click away. */
	function origin(d: Decision): { label: string; open: () => void } | null {
		const task = app.tasks.get(d.taskId);
		if (task) return { label: `#${task.number}`, open: () => overlays.openTask(task.id) };
		const step = app.milestones.get(d.milestoneId);
		if (step)
			return {
				label: `étape « ${step.title} »`,
				open: () => document.getElementById(`etape-${step.id}`)?.scrollIntoView()
			};
		return null;
	}

	const menu = (d: Decision): (MenuItem | 'separator')[] => [
		{
			label: 'Remplacer',
			icon: Replace,
			run: () => overlays.decide({ projectId: project.id, text: d.text, supersedes: d.id })
		},
		...(canWithdraw(d, app.meId)
			? [
					{
						label: 'Retirer',
						icon: Trash2,
						danger: true,
						run: () => actions.roadmap.removeDecision(d)
					}
				]
			: [])
	];
	const newer = (id: string) => all.find((d) => d.supersedes === id);
	/** The message it came from, when this screen knows where it lives. */
	function messageHref(d: Decision) {
		if (!d.messageId) return null;
		const message = app.messages.find(d.messageId) ?? app.questions.get(d.messageId);
		const channel = app.channels.get(message?.channelId);
		if (!channel) return `/p/${project.slug}/discussion`;
		return channel.taskId
			? `?tache=${channel.taskId}`
			: `/p/${project.slug}/discussion/${channel.id}?message=${d.messageId}`;
	}
</script>

<section aria-labelledby="decisions" class="flex flex-col gap-3">
	<header class="flex items-start gap-3">
		<div class="min-w-0 flex-1">
			<h2 id="decisions" class="flex items-center gap-2 text-lg font-semibold tracking-tight">
				<Gavel size={18} class="text-ok-text" aria-hidden="true" />Décisions
			</h2>
			<p class="text-sm text-ink-3">
				Ce qu’on a tranché et pourquoi. « C’est décidé » sur un message, ou c’est noté tout seul
				quand une date bouge.
			</p>
		</div>
		<Button
			size="sm"
			icon={Plus}
			onclick={() => overlays.decide({ projectId: project.id, text: '' })}>Noter</Button
		>
	</header>

	{#if all.length > 5}
		<label class="relative">
			<Search
				size={16}
				class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-3"
				aria-hidden="true"
			/>
			<input
				bind:value={query}
				type="search"
				placeholder="Chercher une décision"
				class="h-11 w-full rounded-xl border border-line-strong/70 bg-surface pr-3 pl-9 text-base outline-none focus:border-accent focus:ring-4 focus:ring-accent-soft"
			/>
		</label>
	{/if}

	{#if shown.length}
		<ul
			class="flex flex-col divide-y divide-line rounded-xl border border-line bg-surface shadow-card"
		>
			{#each shown as d (d.id)}
				{@const from = origin(d)}
				{@const old = replaced.has(d.id)}
				<li
					id="decision-{d.id}"
					class="flex scroll-mt-6 items-start gap-2 px-3.5 py-3 target:bg-accent-soft"
				>
					<div class="min-w-0 flex-1">
						<p class={['text-base', old && 'text-ink-3 line-through decoration-ink-4']}>{d.text}</p>
						{#if d.why}<p class="text-sm text-ink-2">{d.why}</p>{/if}
						<p class="mt-0.5 text-xs text-ink-3">
							{firstName(app.users.get(d.decidedBy)?.name ?? 'Quelqu’un')} · {shortDay(
								d.decidedAt.slice(0, 10)
							)}{#if d.messageId}
								·
								<a href={messageHref(d)} class="font-medium hover:text-accent-text hover:underline"
									>depuis la discussion</a
								>{/if}{#if from}
								·
								<button
									class="font-medium hover:text-accent-text hover:underline"
									onclick={from.open}>{from.label}</button
								>{/if}{#if old && newer(d.id)}
								·
								<a
									href="#decision-{newer(d.id)!.id}"
									class="font-medium hover:text-accent-text hover:underline">remplacée</a
								>{/if}
						</p>
					</div>
					{#if !old}
						<Menu label="Options de la décision" items={menu(d)}>
							{#snippet trigger({ props })}<IconButton
									icon={Ellipsis}
									label="Options de la décision"
									size="sm"
									{...props}
								/>{/snippet}
						</Menu>
					{/if}
				</li>
			{/each}
		</ul>
	{:else if query}
		<p class="text-base text-ink-3">Aucune décision ne correspond.</p>
	{:else}
		<p class="rounded-xl border border-dashed border-line-strong px-4 py-4 text-base text-ink-3">
			Rien de tranché pour l’instant. Quand vous décidez quelque chose dans la discussion, survole
			le message et clique sur le marteau.
		</p>
	{/if}
</section>
