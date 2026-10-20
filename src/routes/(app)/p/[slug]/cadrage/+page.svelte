<script lang="ts">
	import { useApp } from '$lib/client/context';
	import BriefSections from '$lib/connected/framing/BriefSections.svelte';
	import Stakeholders from '$lib/connected/framing/Stakeholders.svelte';
	import SwotBoard from '$lib/connected/framing/SwotBoard.svelte';
	import { currentProject } from '$lib/connected/projects/current.svelte';
	import Hypotheses from '$lib/connected/roadmap/Hypotheses.svelte';
	import DocSection from '$lib/ui/molecules/DocSection.svelte';
	import DocPage from '$lib/ui/organisms/DocPage.svelte';

	const { app } = useApp();
	const project = $derived(currentProject(app));
	const metrics = $derived(
		app.metrics.all.filter((m) => m.projectId === project?.id && !m.archivedAt)
	);
</script>

{#if project}
	<DocPage
		label="Sommaire de la note de cadrage"
		entries={[
			{ id: 'qqoqccp', label: 'QQOQCCP' },
			{ id: 'parties-prenantes', label: 'Parties prenantes' },
			{ id: 'indicateurs', label: 'Indicateurs de succès', count: metrics.length },
			{ id: 'paris', label: 'Paris à vérifier' },
			{ id: 'swot', label: 'SWOT et TOWS' }
		]}
	>
		<DocSection
			id="qqoqccp"
			title="Qui, quoi, où, quand, comment, combien, pourquoi"
			intro="Une ou deux phrases par ligne suffisent. Quand et Comment s’écrivent tout seuls, depuis les étapes et le cahier des charges technique."
		>
			<BriefSections {project} />
		</DocSection>

		<DocSection
			id="parties-prenantes"
			title="Parties prenantes"
			intro="Qui décide, qui paie, qui valide, qui utilise. Le prochain point et le compte rendu disent qui informer."
		>
			<Stakeholders {project} />
		</DocSection>

		<DocSection
			id="indicateurs"
			title="Indicateurs de succès"
			intro="À quoi tu verras que c’est réussi. Ce sont les chiffres de la page Indicateurs, notés chaque semaine."
		>
			{#if metrics.length}
				<ul
					class="flex flex-col divide-y divide-line rounded-2xl border border-line bg-surface px-4 shadow-card"
				>
					{#each metrics as metric (metric.id)}
						<li class="flex items-baseline justify-between gap-3 py-2.5">
							<span class="font-medium">{metric.name}</span>
							<span class="text-sm text-ink-3">
								{metric.target !== null ? `cible ${metric.target} ${metric.unit}` : 'sans cible'}
							</span>
						</li>
					{/each}
				</ul>
			{/if}
			<a href="/p/{project.slug}/indicateurs" class="text-sm text-accent-text hover:underline"
				>{metrics.length ? 'Modifier les chiffres' : 'Ajouter un chiffre de réussite'}</a
			>
		</DocSection>

		<DocSection id="paris" title="Paris à vérifier">
			<Hypotheses {project} />
		</DocSection>

		<DocSection
			id="swot"
			title="SWOT et TOWS"
			intro="Cinq éléments au plus par famille. Chaque croisement donne une stratégie, qui devient une epic à construire ou un pari à vérifier."
		>
			<SwotBoard {project} />
		</DocSection>
	</DocPage>
{/if}
