<script lang="ts">
	import { ArrowRight } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import ModuleMap from '$lib/connected/framing/ModuleMap.svelte';
	import { currentProject } from '$lib/connected/projects/current.svelte';
	import {
		briefSections,
		joinBrief,
		STARTING_HEADINGS,
		type BriefHeading
	} from '$lib/modules/projects/domain/project';
	import { orderMilestones } from '$lib/modules/roadmap/domain/milestone';
	import Button from '$lib/ui/atoms/Button.svelte';
	import DocSection from '$lib/ui/molecules/DocSection.svelte';
	import EditableText from '$lib/ui/molecules/EditableText.svelte';
	import ProseField from '$lib/ui/molecules/ProseField.svelte';
	import PageHeader from '$lib/ui/organisms/PageHeader.svelte';

	const { app, actions } = useApp();
	const project = $derived(currentProject(app));
	const sections = $derived(briefSections(project?.brief ?? ''));
	const steps = $derived(
		orderMilestones(app.milestones.all.filter((m) => m.projectId === project?.id))
	);
	const QUESTIONS: Partial<Record<BriefHeading, { label: string; hint: string }>> = {
		Pourquoi: {
			label: 'Pourquoi ce projet ?',
			hint: 'Le problème, et ce qu’il coûte aujourd’hui. Ex. : les kinés prennent les RDV au téléphone entre deux patients.'
		},
		Qui: {
			label: 'Pour qui ?',
			hint: 'Qui l’utilise, qui décide, qui paie. Ex. : les kinés seuls ou à deux ; le patient réserve, le kiné paie.'
		},
		Quoi: {
			label: 'Quoi, en une phrase ?',
			hint: 'Ce qu’on fait de différent. Ex. : la réservation en ligne la plus simple, à 19 € par mois.'
		}
	};
	const save = (heading: BriefHeading, text: string) =>
		project &&
		actions.projects.update(project.id, { brief: joinBrief({ ...sections, [heading]: text }) });
</script>

<svelte:head><title>Pour démarrer · {project?.name ?? ''} · Crystal</title></svelte:head>

{#if project}
	<PageHeader
		title="Pour démarrer"
		subtitle="Trois questions, les grandes parties du produit, puis les étapes. Dix minutes, et tu passes au tableau. Le reste se complète plus tard, quand tu veux."
	/>
	<div class="mx-auto flex max-w-[820px] flex-col gap-12 px-4 pt-6 pb-16 sm:px-8">
		<DocSection id="questions" title="1. Le projet en trois réponses">
			<div class="flex flex-col gap-5">
				{#each STARTING_HEADINGS as heading (heading)}
					{@const q = QUESTIONS[heading]!}
					<div class="flex flex-col gap-1">
						<h3 class="text-base font-semibold">{q.label}</h3>
						<ProseField
							label={q.label}
							value={sections[heading]}
							maxlength={4000}
							placeholder={q.hint}
							onsave={(text) => save(heading, text)}
						/>
					</div>
				{/each}
			</div>
		</DocSection>

		{#if project.kind !== 'express'}
			<DocSection
				id="modules"
				title="2. Les grandes parties du produit"
				intro="Les modules : le site, la prise de rendez-vous, le paiement… Ils rangent le tableau et le cahier des charges."
			>
				<ModuleMap {project} />
			</DocSection>
		{/if}

		<DocSection
			id="etapes"
			title={project.kind === 'express' ? '2. Les étapes' : '3. Les étapes'}
			intro="Elles viennent du modèle choisi. Dis pour chacune quand elle est finie : c’est ce qu’on vérifiera pour la clore."
		>
			{#if steps.length}
				<ol
					class="flex flex-col divide-y divide-line rounded-2xl border border-line bg-surface px-4 shadow-card"
				>
					{#each steps as step (step.id)}
						<li class="flex flex-col py-2">
							<EditableText
								label="Étape"
								value={step.title}
								maxlength={80}
								class="font-semibold"
								onsave={(title) => actions.roadmap.updateStep(step.id, { title })}
							/>
							<EditableText
								label="C’est fini quand"
								value={step.doneWhen}
								placeholder="C’est fini quand…"
								allowEmpty
								maxlength={300}
								class="text-sm text-ink-2"
								onsave={(doneWhen) => actions.roadmap.updateStep(step.id, { doneWhen })}
							/>
						</li>
					{/each}
				</ol>
			{:else}
				<a
					href="/p/{project.slug}/feuille-de-route"
					class="text-sm text-accent-text hover:underline"
					>Poser les étapes sur la feuille de route</a
				>
			{/if}
		</DocSection>

		<div class="flex flex-wrap items-center gap-3">
			<Button variant="primary" icon={ArrowRight} href="/p/{project.slug}/tableau"
				>C’est bon, au tableau</Button
			>
			<a href="/p/{project.slug}/cadrage" class="text-sm text-ink-3 hover:text-ink"
				>Ou compléter le cadrage maintenant</a
			>
		</div>
	</div>
{/if}
