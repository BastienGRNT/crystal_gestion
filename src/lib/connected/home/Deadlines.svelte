<script lang="ts">
	import { Flag, TriangleAlert } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { dueLabel, plural } from '$lib/client/format';
	import { now } from '$lib/client/now.svelte';
	import { deliveryForecast } from '$lib/client/views/forecast';
	import { addDays, daysBetween } from '$lib/modules/kernel/domain/dates';
	import { dueState } from '$lib/modules/tasks/domain/deadline';
	import { isOpen } from '$lib/modules/tasks/domain/task';
	import type { Project } from '$lib/modules/projects/domain/project';
	import Avatar from '$lib/ui/atoms/Avatar.svelte';
	import { projectTasks } from '../projects/current.svelte';
	import { riskOf } from '../tasks/risk';

	let { project }: { project: Project } = $props();
	const { app, overlays } = useApp();
	const horizon = $derived(addDays(now.today, 14));
	const tasks = $derived(projectTasks(app, project.id));
	const due = $derived(
		tasks
			.filter((t) => isOpen(t) && t.dueDate && t.dueDate <= horizon)
			.sort((a, b) => a.dueDate!.localeCompare(b.dueDate!))
			.map((task) => ({ task, risk: riskOf(app, task) }))
	);
	const atRisk = $derived(due.filter((d) => d.risk).length);
	const delivery = $derived(project.deadline ? daysBetween(now.today, project.deadline) : null);
	const forecast = $derived(
		project.deadline ? deliveryForecast(tasks, project.deadline, now.today, now.value) : null
	);
	const pace = $derived(
		forecast?.perWeek.toLocaleString('fr-FR', { maximumFractionDigits: 1 }) ?? ''
	);
	const tones = {
		overdue: 'text-danger-text',
		today: 'text-warn-text',
		soon: 'text-warn-text',
		later: 'text-ink-3'
	};
</script>

<section aria-labelledby="deadlines" class="flex flex-col gap-3">
	<header class="flex items-baseline gap-3">
		<h2 id="deadlines" class="text-lg font-semibold tracking-tight">Échéances</h2>
		{#if atRisk}<span class="text-sm font-medium text-danger-text"
				>{plural(atRisk, 'à surveiller', 'à surveiller')}</span
			>{:else if due.length}<span class="text-sm text-ink-3">rien d’inquiétant</span>{/if}
	</header>
	{#if delivery !== null}
		<div
			class={[
				'flex flex-col gap-1 rounded-xl px-4 py-3',
				delivery < 0 ? 'bg-danger-soft text-danger-text' : 'bg-sunken text-ink'
			]}
		>
			<p class="flex items-center gap-2 text-base font-semibold">
				<Flag size={17} />
				{delivery < 0
					? `Livraison dépassée de ${-delivery} j`
					: delivery === 0
						? 'Livraison aujourd’hui'
						: `Livraison dans ${delivery} jour${delivery > 1 ? 's' : ''}`}
			</p>
			<!-- The pace of the last four weeks says it before the date does. -->
			{#if forecast}
				<p class="text-sm text-ink-2">
					{#if forecast.fits}
						À votre rythme (~{pace} tâches finies par semaine), les {forecast.open} tâches ouvertes tiennent
						d’ici là.
					{:else}
						À votre rythme (~{pace} par semaine),
						<span class="font-semibold text-danger-text"
							>{plural(forecast.excess, 'tâche')} de trop</span
						>
						pour la livraison.
						<a
							href="/p/{project.slug}/priorites"
							class="font-medium text-accent-text hover:underline">Choisir quoi repousser</a
						>
					{/if}
				</p>
			{/if}
		</div>
	{/if}
	{#if due.length}
		<ul class="flex flex-col">
			{#each due as { task, risk } (task.id)}
				{@const assignee = app.users.get(task.assigneeId)}
				{@const state = dueState(task.dueDate, now.today) ?? 'later'}
				<li>
					<button
						onclick={() => overlays.openTask(task.id)}
						class="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-1.5 text-left hover:bg-hover"
					>
						<span class={['w-28 shrink-0 text-sm font-semibold', tones[state]]}
							>{dueLabel(task.dueDate!, now.today)}</span
						>
						<span class="min-w-0 flex-1">
							<span class="block truncate text-base">{task.title}</span>
							{#if risk}
								<span
									class={[
										'flex items-center gap-1 text-sm font-medium',
										risk.tone === 'danger' ? 'text-danger-text' : 'text-warn-text'
									]}><TriangleAlert size={13} class="shrink-0" />{risk.text}</span
								>
							{/if}
						</span>
						{#if assignee}<Avatar name={assignee.name} color={assignee.color} size="sm" />{/if}
					</button>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="text-base text-ink-3">Aucune échéance dans les deux semaines.</p>
	{/if}
</section>
