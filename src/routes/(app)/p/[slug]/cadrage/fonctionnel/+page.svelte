<script lang="ts">
	import { useApp } from '$lib/client/context';
	import { scopeOf, toSort } from '$lib/client/views/framing';
	import EpicBoard from '$lib/connected/framing/EpicBoard.svelte';
	import Glossary from '$lib/connected/framing/Glossary.svelte';
	import Initiatives from '$lib/connected/framing/Initiatives.svelte';
	import Journeys from '$lib/connected/framing/Journeys.svelte';
	import ModuleMap from '$lib/connected/framing/ModuleMap.svelte';
	import Personas from '$lib/connected/framing/Personas.svelte';
	import TestCases from '$lib/connected/framing/TestCases.svelte';
	import ToSortList from '$lib/connected/framing/ToSortList.svelte';
	import { currentProject } from '$lib/connected/projects/current.svelte';
	import { briefSections } from '$lib/modules/projects/domain/project';
	import DocSection from '$lib/ui/molecules/DocSection.svelte';
	import DocPage from '$lib/ui/organisms/DocPage.svelte';
	import RichText from '$lib/ui/organisms/RichText.svelte';

	const { app } = useApp();
	const project = $derived(currentProject(app));
	const loose = $derived(toSort(app.tasks.all.filter((t) => t.projectId === project?.id)).length);
	const epics = $derived(app.epics.all.filter((e) => e.projectId === project?.id));
	const scope = $derived(scopeOf(epics, project?.brief ?? ''));
	const why = $derived(briefSections(project?.brief ?? '').Pourquoi);
	const stories = $derived(app.stories.all.filter((s) => s.projectId === project?.id).length);
</script>

{#if project}
	<DocPage
		label="Sommaire du cahier des charges fonctionnel"
		entries={[
			...(loose
				? [{ id: 'a-ranger', label: 'À ranger', count: loose, tone: 'warn' as const }]
				: []),
			{ id: 'contexte', label: '1 Contexte et objectifs' },
			{ id: 'perimetre', label: '2 Périmètre' },
			{ id: 'personas', label: '3 Personas et acteurs' },
			{ id: 'cartographie', label: '4 Cartographie' },
			{ id: 'stories', label: '5 Epics et stories', count: stories },
			{ id: 'parcours', label: '6 Parcours' },
			{ id: 'tests', label: '7 Données de test' },
			{ id: 'glossaire', label: '8 Glossaire' }
		]}
	>
		{#if loose}
			<DocSection
				id="a-ranger"
				title="À ranger"
				intro="Les fonctionnalités ajoutées au tableau sans epic ni story. Range-les quand tu veux : rien ne bloque en attendant."
			>
				<ToSortList {project} />
			</DocSection>
		{/if}

		<DocSection
			id="contexte"
			title="1. Contexte et objectifs"
			intro="Le pourquoi vient de la note de cadrage. Les initiatives sont les grands objectifs, chacun mesuré par un chiffre."
		>
			{#if why}
				<div class="rounded-2xl bg-surface-2 px-4 py-3"><RichText body={why} size="base" /></div>
			{:else}
				<a href="/p/{project.slug}/cadrage" class="text-sm text-accent-text hover:underline"
					>Écrire le pourquoi dans la note de cadrage</a
				>
			{/if}
			<Initiatives {project} />
		</DocSection>

		<DocSection
			id="perimetre"
			title="2. Périmètre"
			intro="Calculé : les epics prévues sont dans le périmètre ; celles passées à plus tard et « ce qu’on ne fait pas » en sortent."
		>
			<div class="grid gap-3 sm:grid-cols-2">
				<div
					class="flex flex-col gap-1 rounded-2xl border border-line bg-surface px-4 py-3 shadow-card"
				>
					<h3 class="text-sm font-semibold text-ok-text">Inclus</h3>
					{#each scope.inScope as epic (epic.id)}<p class="text-base">{epic.title}</p>{:else}<p
							class="text-sm text-ink-3"
						>
							Aucune epic pour l’instant.
						</p>{/each}
				</div>
				<div
					class="flex flex-col gap-1 rounded-2xl border border-line bg-surface px-4 py-3 shadow-card"
				>
					<h3 class="text-sm font-semibold text-ink-2">Exclu</h3>
					{#if scope.notDoing}<RichText body={scope.notDoing} size="base" />{/if}
					{#each scope.later as epic (epic.id)}<p class="text-base text-ink-2">
							{epic.title} <span class="text-sm text-ink-3">· plus tard</span>
						</p>{/each}
					{#if !scope.notDoing && !scope.later.length}<p class="text-sm text-ink-3">
							Rien de précisé : dis-le dans « Ce qu’on ne fait pas ».
						</p>{/if}
				</div>
			</div>
		</DocSection>

		<DocSection
			id="personas"
			title="3. Personas et acteurs"
			intro="Les types d’utilisateurs : leurs besoins, leur aisance avec la technique, ce qu’ils font dans l’application."
		>
			<Personas {project} />
		</DocSection>

		<DocSection
			id="cartographie"
			title="4. Cartographie des fonctionnalités"
			intro="Les modules du produit, sur deux niveaux. Ce sont les mêmes que ceux du tableau."
		>
			<ModuleMap {project} />
		</DocSection>

		<DocSection
			id="stories"
			title="5. Epics et user stories"
			intro="Initiative → epic → story, chacune avec ses critères d’acceptation. L’avancement se calcule depuis les tâches."
		>
			<EpicBoard {project} />
		</DocSection>

		<DocSection
			id="parcours"
			title="6. Parcours utilisateurs"
			intro="Les enchaînements d’écrans et les règles de gestion : que se passe-t-il si… ?"
		>
			<Journeys {project} />
		</DocSection>

		<DocSection
			id="tests"
			title="7. Jeu de données de test"
			intro="Rassemblé depuis les critères d’acceptation : rien n’est saisi deux fois."
		>
			<TestCases {project} />
		</DocSection>

		<DocSection
			id="glossaire"
			title="8. Glossaire"
			intro="Les mots du métier, pour que tout le monde parle de la même chose."
		>
			<Glossary {project} />
		</DocSection>
	</DocPage>
{/if}
