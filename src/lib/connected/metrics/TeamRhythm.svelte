<script lang="ts">
	import { KINDS } from '$lib/client/labels';
	import { useApp } from '$lib/client/context';
	import { shortDay } from '$lib/client/format';
	import { now } from '$lib/client/now.svelte';
	import { teamRhythm } from '$lib/client/views/metrics';
	import { TASK_KINDS, type TaskKind } from '$lib/modules/tasks/domain/task';
	import type { Project } from '$lib/modules/projects/domain/project';

	let { project }: { project: Project } = $props();
	const { app } = useApp();

	const tasks = $derived(app.tasks.all.filter((t) => t.projectId === project.id));
	const rhythm = $derived(teamRhythm(tasks, now.value));
	const peak = $derived(Math.max(1, ...rhythm.weeks.map((w) => w.total)));
	const BAR: Record<TaskKind, string> = {
		feature: 'bg-accent',
		bug: 'bg-danger',
		tech: 'bg-ink-3',
		action: 'bg-delegate'
	};
	const round = (n: number) => Math.round(n * 10) / 10;
	const days = (n: number | null) => (n === null ? '—' : `${round(n).toLocaleString('fr')} j`);
	const trend = $derived(rhythm.perWeek - rhythm.perWeekBefore);
</script>

{#snippet tile(
	title: string,
	value: string,
	note: string,
	tone: 'neutral' | 'warn' | 'danger' = 'neutral'
)}
	<div class="flex flex-col gap-1 rounded-2xl border border-line bg-surface p-4 shadow-card">
		<p class="text-sm font-semibold text-ink-2">{title}</p>
		<p
			class={[
				'text-2xl font-semibold tabular-nums',
				tone === 'danger' ? 'text-danger-text' : tone === 'warn' ? 'text-warn-text' : 'text-ink'
			]}
		>
			{value}
		</p>
		<p class="text-sm text-ink-3">{note}</p>
	</div>
{/snippet}

<section aria-labelledby="rhythm" class="flex flex-col gap-4">
	<div>
		<h2 id="rhythm" class="text-lg font-semibold tracking-tight">Le rythme de l’équipe</h2>
		<p class="text-sm text-ink-3">
			Calculé depuis le tableau, sans rien saisir : sur les quatre dernières semaines.
		</p>
	</div>

	<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
		{@render tile(
			'Terminé par semaine',
			round(rhythm.perWeek).toLocaleString('fr'),
			rhythm.perWeekBefore
				? `${trend >= 0 ? '+' : ''}${round(trend).toLocaleString('fr')} par rapport aux 4 semaines d’avant`
				: 'Toutes tâches confondues'
		)}
		{@render tile(
			'Bugs ouverts',
			String(rhythm.openBugs),
			rhythm.openBugs
				? `${rhythm.criticalBugs ? `${rhythm.criticalBugs} bloquant${rhythm.criticalBugs > 1 ? 's' : ''} · ` : ''}le plus vieux a ${rhythm.oldestBugDays} j · cette semaine : ${rhythm.bugsIn} signalé${rhythm.bugsIn > 1 ? 's' : ''}, ${rhythm.bugsOut} corrigé${rhythm.bugsOut > 1 ? 's' : ''}`
				: `Cette semaine : ${rhythm.bugsIn} signalé${rhythm.bugsIn > 1 ? 's' : ''}, ${rhythm.bugsOut} corrigé${rhythm.bugsOut > 1 ? 's' : ''}`,
			rhythm.criticalBugs ? 'danger' : rhythm.bugsIn > rhythm.bugsOut ? 'warn' : 'neutral'
		)}
		{@render tile(
			'Du début à la fin',
			days(rhythm.cycleDays.feature),
			`Médiane d’une fonctionnalité · bug ${days(rhythm.cycleDays.bug)} · technique ${days(rhythm.cycleDays.tech)}`
		)}
		{@render tile(
			'Relectures qui attendent',
			String(rhythm.waitingReview),
			'En revue depuis plus d’un jour',
			rhythm.waitingReview ? 'warn' : 'neutral'
		)}
		{@render tile(
			'Échéances tenues',
			rhythm.onTime === null ? '—' : `${Math.round(rhythm.onTime * 100)} %`,
			rhythm.onTime === null
				? 'Il faut au moins 3 tâches finies avec une échéance'
				: 'Parmi les tâches finies qui avaient une échéance'
		)}
		{@render tile(
			'Bug bloquant corrigé en',
			rhythm.criticalFixHours === null ? '—' : `${Math.round(rhythm.criticalFixHours)} h`,
			'Médiane, de son signalement à sa correction'
		)}
	</div>

	<div class="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 shadow-card">
		<p class="text-sm font-semibold text-ink-2">Où part le temps (tâches finies, 4 semaines)</p>
		<div class="flex h-3 overflow-hidden rounded-full bg-sunken" aria-hidden="true">
			{#each TASK_KINDS as kind (kind)}
				<span class={BAR[kind]} style:width="{rhythm.share[kind] * 100}%"></span>
			{/each}
		</div>
		<p class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-2">
			{#each TASK_KINDS as kind (kind)}
				<span class="inline-flex items-center gap-1.5"
					><span class={['size-2.5 rounded-[3px]', BAR[kind]]}></span>{KINDS[kind].plural}
					<span class="font-semibold tabular-nums">{Math.round(rhythm.share[kind] * 100)} %</span
					></span
				>
			{/each}
		</p>

		<p class="mt-2 text-sm font-semibold text-ink-2">Terminé, semaine par semaine</p>
		<div class="flex h-28 items-end gap-2" role="img" aria-label="Tâches terminées par semaine">
			{#each rhythm.weeks as week (week.weekOf)}
				<div class="flex min-w-0 flex-1 flex-col items-center gap-1">
					<span class="text-xs text-ink-3 tabular-nums">{week.total || ''}</span>
					<div
						class="flex w-full max-w-10 flex-col-reverse overflow-hidden rounded-md bg-sunken"
						style:height="{(week.total / peak) * 80}px"
					>
						{#each TASK_KINDS as kind (kind)}
							<span
								class={BAR[kind]}
								style:height="{week.total ? (week.byKind[kind] / week.total) * 100 : 0}%"
							></span>
						{/each}
					</div>
					<span class="text-xs text-ink-3">{shortDay(week.weekOf)}</span>
				</div>
			{/each}
		</div>
	</div>
</section>
