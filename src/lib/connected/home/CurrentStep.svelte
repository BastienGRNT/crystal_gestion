<script lang="ts">
	import { CircleCheckBig, Compass } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { shortDay } from '$lib/client/format';
	import { now } from '$lib/client/now.svelte';
	import type { Project } from '$lib/modules/projects/domain/project';
	import { roadmapHref, roadmapOf } from '../roadmap/roadmap-of';
	import { paceText } from '../roadmap/step-text';

	let { project }: { project: Project } = $props();
	const { app } = useApp();

	const roadmap = $derived(roadmapOf(app, project.id, now.today, now.value));
	// One line per module moving forward, the project's own line first.
	const moduleName = (id: string | null) => app.components.get(id)?.name;

	const href = $derived(roadmapHref(project.slug));
</script>

{#each roadmap.currents as step (step.id)}
	{@const forecast = roadmap.forecasts.get(step.id)}
	{@const pace = paceText(forecast)}
	{@const module = roadmap.currents.length > 1 ? moduleName(step.componentId) : undefined}
	{#if forecast}
		<a
			href="{href}#etape-{step.id}"
			class="flex flex-col gap-2 rounded-2xl border border-line bg-surface px-4 py-3 shadow-card hover:border-line-strong"
		>
			<span class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
				<Compass size={17} class="shrink-0 self-center text-accent-text" aria-hidden="true" />
				<span class="text-sm text-ink-3"
					>{module ?? `Étape ${roadmap.steps.indexOf(step) + 1}/${roadmap.steps.length}`}</span
				>
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
					class={[
						'block h-full rounded-full',
						forecast.state === 'late' ? 'bg-danger' : 'bg-accent'
					]}
					style:width="{forecast.total ? Math.round((forecast.done / forecast.total) * 100) : 0}%"
				></span>
			</span>
		</a>
	{/if}
{/each}
