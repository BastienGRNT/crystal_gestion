<script lang="ts">
	import { useApp } from '$lib/client/context';
	import { now } from '$lib/client/now.svelte';
	import { metricViews } from '$lib/client/views/metrics';
	import { MAX_METRICS } from '$lib/modules/roadmap/domain/metric';
	import type { Project } from '$lib/modules/projects/domain/project';
	import InlineAdd from '$lib/ui/molecules/InlineAdd.svelte';
	import MetricTile from '$lib/ui/molecules/MetricTile.svelte';
	import { metricsOf, readingsOf } from '../roadmap/roadmap-of';

	let { project }: { project: Project } = $props();
	const { app, actions } = useApp();

	const views = $derived(
		metricViews(metricsOf(app, project.id), readingsOf(app, project.id), now.today)
	);
</script>

<section aria-labelledby="numbers" class="flex flex-col gap-4">
	<div>
		<h2 id="numbers" class="text-lg font-semibold tracking-tight">Les chiffres du projet</h2>
		<p class="text-sm text-ink-3">
			Ce qui dit que ça marche (clients payants, MRR, rendez-vous pris…), noté une fois par semaine.
			Ils arrivent dans le compte rendu et l’accueil les demande le lundi.
		</p>
	</div>

	<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
		{#each views as view (view.metric.id)}
			{@const metric = view.metric}
			<MetricTile
				name={metric.name}
				unit={metric.unit}
				target={metric.target}
				direction={metric.direction}
				values={view.series.map((p) => p.value)}
				last={view.last}
				delta={view.delta}
				good={view.good}
				thisWeek={view.thisWeek}
				onrename={(name) => actions.roadmap.updateMetric(metric.id, { name })}
				ontarget={(target) => actions.roadmap.updateMetric(metric.id, { target })}
				ondirection={(direction) => actions.roadmap.updateMetric(metric.id, { direction })}
				onrecord={(value) => actions.roadmap.record(metric, value)}
				onremove={() => actions.roadmap.removeMetric(metric)}
			/>
		{/each}
		{#if views.length < MAX_METRICS}
			<div
				class="flex flex-col justify-center gap-2 rounded-2xl border border-dashed border-line-strong p-4"
			>
				{#if !views.length}
					<p class="text-base text-ink-2">
						Aucun chiffre suivi. Ajoute celui qui dirait que le projet réussit.
					</p>
				{/if}
				<InlineAdd
					label="Ajouter un chiffre"
					placeholder="Nom et cible, puis Entrée (ex. : clients payants 50)"
					hint="Un nombre à la fin devient la cible ; « € » ou « % » après, l’unité."
					onadd={(text) => actions.roadmap.addMetric(project.id, text) !== null}
				/>
			</div>
		{:else}
			<p class="self-center text-sm text-ink-3">
				Cinq chiffres suffisent : retires-en un pour en suivre un autre.
			</p>
		{/if}
	</div>
</section>
