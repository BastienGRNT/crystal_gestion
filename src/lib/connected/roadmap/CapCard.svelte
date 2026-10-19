<script lang="ts">
	import { ChevronDown, Crosshair } from '@lucide/svelte';
	import { untrack } from 'svelte';
	import { useApp } from '$lib/client/context';
	import { startOfWeek } from '$lib/modules/kernel/domain/dates';
	import { latestReadings } from '$lib/modules/roadmap/domain/metric';
	import {
		CAP_LIMITS,
		isFramed,
		type Project,
		type ProjectPatch
	} from '$lib/modules/projects/domain/project';
	import { now } from '$lib/client/now.svelte';
	import InlineField from '$lib/ui/molecules/InlineField.svelte';
	import MetricInput from '$lib/ui/molecules/MetricInput.svelte';
	import { readingsOf } from './roadmap-of';

	let { project }: { project: Project } = $props();
	const { app, actions } = useApp();

	// Open until the project is framed, then folded to one line: read once, changed rarely.
	// Decided on arrival only, so filling the fields never folds it under the cursor.
	// A short project (fewer than three steps) never gets it unfolded: it does not need framing.
	let expanded = $state(
		untrack(
			() =>
				!isFramed(project) &&
				app.milestones.all.filter((m) => m.projectId === project.id).length >= 3
		)
	);
	const readings = $derived(latestReadings(readingsOf(app, project.id)));
	const thisWeek = $derived(readings.find((r) => r.weekOf === startOfWeek(now.today)));
	const last = $derived(readings[0]);
	const save = (patch: ProjectPatch) => actions.projects.update(project.id, patch);

	function saveTarget(text: string) {
		const target = text.trim() ? Number(text.replace(',', '.')) : null;
		if (target === null || Number.isFinite(target)) save({ metricTarget: target });
	}
</script>

<section
	id="cap"
	aria-labelledby="cap-title"
	class="scroll-mt-6 rounded-2xl border border-line bg-surface shadow-card"
>
	<div class="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3.5">
		<button
			class="flex min-w-0 flex-1 items-start gap-3 text-left"
			onclick={() => (expanded = !expanded)}
			aria-expanded={expanded}
		>
			<Crosshair size={20} class="mt-0.5 shrink-0 text-accent-text" aria-hidden="true" />
			<span class="min-w-0 flex-1">
				<span id="cap-title" class="block text-lg font-semibold tracking-tight">Le cap</span>
				<span class="block text-base text-ink-2">
					{#if project.description}{project.description}{:else}Pour qui, pourquoi, jusqu’où, et
						comment on saura que ça marche. Dix minutes, une fois.{/if}
				</span>
			</span>
			<ChevronDown
				size={18}
				class={['mt-1 shrink-0 text-ink-3 transition-transform', expanded && 'rotate-180']}
				aria-hidden="true"
			/>
		</button>
		{#if project.metricName}
			<div class="flex flex-wrap items-center gap-3">
				<p class="text-base">
					<span class="text-ink-2">{project.metricName} :</span>
					<span class="font-semibold tabular-nums">{last?.value ?? '—'}</span
					>{#if project.metricTarget !== null}<span class="text-ink-3">
							/ {project.metricTarget}</span
						>{/if}
				</p>
				<MetricInput
					label="{project.metricName} cette semaine"
					value={thisWeek?.value ?? null}
					onsave={(value) => actions.roadmap.record(project.id, value)}
				/>
			</div>
		{/if}
	</div>

	{#if expanded}
		<div class="grid gap-4 border-t border-line px-4 py-4 md:grid-cols-2">
			<InlineField
				label="Pour qui"
				value={project.audience}
				maxlength={CAP_LIMITS.audience}
				placeholder="Ex. : les kinés libéraux qui travaillent seuls"
				onsave={(audience) => save({ audience })}
			/>
			<InlineField
				label="Leur problème"
				value={project.problem}
				maxlength={CAP_LIMITS.problem}
				placeholder="Ex. : 40 minutes par jour au téléphone pour les rendez-vous"
				onsave={(problem) => save({ problem })}
			/>
			<InlineField
				label="Notre réponse, en une phrase"
				value={project.description}
				maxlength={500}
				placeholder="Ex. : leurs patients prennent rendez-vous en ligne, seuls"
				onsave={(description) => save({ description })}
			/>
			<InlineField
				label="Qui paie, combien (facultatif)"
				value={project.payer}
				maxlength={CAP_LIMITS.payer}
				placeholder="Ex. : le kiné, 29 € par mois"
				onsave={(payer) => save({ payer })}
			/>
			<InlineField
				label="Ce qu’on ne fait pas"
				value={project.outOfScope}
				maxlength={CAP_LIMITS.outOfScope}
				multiline
				placeholder="Ex. : téléconsultation, facturation CPAM (Maj+Entrée pour aller à la ligne)"
				onsave={(outOfScope) => save({ outOfScope })}
			/>
			<div class="grid grid-cols-[1fr_6rem] gap-2">
				<InlineField
					label="Réussi si… (un seul chiffre)"
					value={project.metricName}
					maxlength={CAP_LIMITS.metricName}
					placeholder="Ex. : clients payants"
					onsave={(metricName) => save({ metricName })}
				/>
				<InlineField
					label="Cible"
					value={project.metricTarget === null ? '' : String(project.metricTarget)}
					maxlength={12}
					placeholder="50"
					onsave={saveTarget}
				/>
			</div>
		</div>
		<p class="px-4 pb-4 text-sm text-ink-3">
			Enregistré en quittant chaque champ. Le chiffre se note une fois par semaine, une fois le
			projet lancé : il arrive dans le compte rendu.
		</p>
	{/if}
</section>
