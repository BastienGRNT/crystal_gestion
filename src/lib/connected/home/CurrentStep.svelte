<script lang="ts">
	import { ChartLine, CircleCheckBig, Compass, Crosshair, X } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { shortDay } from '$lib/client/format';
	import { now } from '$lib/client/now.svelte';
	import { startOfWeek } from '$lib/modules/kernel/domain/dates';
	import { isFramed, type Project } from '$lib/modules/projects/domain/project';
	import IconButton from '$lib/ui/atoms/IconButton.svelte';
	import MetricInput from '$lib/ui/molecules/MetricInput.svelte';
	import { metricMissing, readingsOf, roadmapHref, roadmapOf } from '../roadmap/roadmap-of';
	import { paceText } from '../roadmap/step-text';

	let { project }: { project: Project } = $props();
	const { app, actions } = useApp();

	const roadmap = $derived(roadmapOf(app, project.id, now.today, now.value));
	const step = $derived(roadmap.current);
	const forecast = $derived(roadmap.currentForecast);
	const rank = $derived(step ? roadmap.steps.indexOf(step) + 1 : 0);
	const pace = $derived(paceText(forecast));
	const askMetric = $derived(metricMissing(app, project, now.today));
	const thisWeek = $derived(
		readingsOf(app, project.id).find((r) => r.weekOf === startOfWeek(now.today))
	);

	// Short projects (two steps) are never asked to frame themselves; dismissing is per device.
	const nudgeKey = () => `crystal-cap-nudge-${project.id}`;
	let dismissed = $state(read());
	function read() {
		try {
			return localStorage.getItem(nudgeKey()) === 'off';
		} catch {
			return false;
		}
	}
	function dismiss() {
		dismissed = true;
		try {
			localStorage.setItem(nudgeKey(), 'off');
		} catch {
			// Hidden for this visit only.
		}
	}
	const nudge = $derived(!dismissed && roadmap.steps.length >= 3 && !isFramed(project));
	const href = $derived(roadmapHref(project.slug));
</script>

{#if nudge}
	<div
		class="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 shadow-card"
	>
		<Crosshair size={18} class="shrink-0 text-accent-text" aria-hidden="true" />
		<a href="{href}#cap" class="min-w-0 flex-1 text-base hover:underline">
			<span class="font-semibold">Le cap n’est pas posé :</span> six questions courtes, dix minutes, et
			tout le monde sait pour qui et pourquoi.
		</a>
		<IconButton icon={X} label="Ne plus proposer" size="sm" onclick={dismiss} />
	</div>
{/if}

{#if step && forecast}
	<a
		{href}
		class="flex flex-col gap-2 rounded-2xl border border-line bg-surface px-4 py-3 shadow-card hover:border-line-strong"
	>
		<span class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
			<Compass size={17} class="shrink-0 self-center text-accent-text" aria-hidden="true" />
			<span class="text-sm text-ink-3">Étape {rank}/{roadmap.steps.length}</span>
			<span class="text-base font-semibold">{step.title}</span>
			<span class="text-sm text-ink-2"
				>· {forecast.done}/{forecast.total} tâches{step.targetDate
					? ` · pour le ${shortDay(step.targetDate)}`
					: ''}</span
			>
			{#if forecast.ready}
				<span class="flex items-center gap-1 text-sm font-semibold text-ok-text"
					><CircleCheckBig size={14} />tout est fait : à clore</span
				>
			{:else if pace}
				<span
					class={[
						'text-sm',
						forecast.state === 'late' ? 'font-semibold text-danger-text' : 'text-ink-3'
					]}>· {pace}</span
				>
			{/if}
		</span>
		<span class="h-1.5 overflow-hidden rounded-full bg-sunken" aria-hidden="true">
			<span
				class={['block h-full rounded-full', forecast.state === 'late' ? 'bg-danger' : 'bg-accent']}
				style:width="{forecast.total ? Math.round((forecast.done / forecast.total) * 100) : 0}%"
			></span>
		</span>
	</a>
{/if}

{#if askMetric}
	<div
		class="flex flex-wrap items-center gap-3 rounded-2xl border border-plan/30 bg-plan-soft px-4 py-3"
	>
		<ChartLine size={18} class="shrink-0 text-plan-text" aria-hidden="true" />
		<p class="min-w-0 flex-1 text-base">
			<span class="font-semibold">{project.metricName}</span> cette semaine ?
			<span class="text-ink-2">Dix secondes, et c’est dans le compte rendu.</span>
		</p>
		<MetricInput
			label="{project.metricName} cette semaine"
			value={thisWeek?.value ?? null}
			onsave={(value) => actions.roadmap.record(project.id, value)}
		/>
	</div>
{/if}
