<script lang="ts">
	import { ChartLine } from '@lucide/svelte';
	import { untrack } from 'svelte';
	import { useApp } from '$lib/client/context';
	import { now } from '$lib/client/now.svelte';
	import { metricViews } from '$lib/client/views/metrics';
	import type { Project } from '$lib/modules/projects/domain/project';
	import MetricInput from '$lib/ui/molecules/MetricInput.svelte';
	import { metricsOf, missingMetrics, readingsOf } from '../roadmap/roadmap-of';

	let { project }: { project: Project } = $props();
	const { app, actions } = useApp();

	// Decided on arrival: a field never vanishes under the cursor once its value is noted.
	const missing = untrack(
		() => new Set(missingMetrics(app, project.id, now.today).map((m) => m.id))
	);
	const views = $derived(
		metricViews(metricsOf(app, project.id), readingsOf(app, project.id), now.today).filter((v) =>
			missing.has(v.metric.id)
		)
	);
</script>

{#if views.length}
	<section
		aria-labelledby="week-numbers"
		class="flex flex-wrap items-end gap-x-5 gap-y-3 rounded-2xl border border-plan/30 bg-plan-soft px-4 py-3"
	>
		<div class="flex min-w-0 basis-full items-center gap-2 sm:basis-auto sm:self-center">
			<ChartLine size={18} class="shrink-0 text-plan-text" aria-hidden="true" />
			<p id="week-numbers" class="text-base">
				<span class="font-semibold">Les chiffres de la semaine</span>
				<span class="text-ink-2">· Entrée pour noter, ils partent dans le compte rendu.</span>
			</p>
		</div>
		{#each views as view (view.metric.id)}
			<label class="flex flex-col gap-1">
				<span class="text-sm font-medium text-ink-2">{view.metric.name}</span>
				<MetricInput
					label="{view.metric.name} cette semaine"
					value={view.thisWeek}
					placeholder={view.last === null ? '—' : `${view.last} avant`}
					onsave={(value) => actions.roadmap.record(view.metric, value)}
				/>
			</label>
		{/each}
	</section>
{/if}
