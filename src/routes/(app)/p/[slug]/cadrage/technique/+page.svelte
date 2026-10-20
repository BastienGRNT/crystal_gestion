<script lang="ts">
	import { useApp } from '$lib/client/context';
	import { currentProject } from '$lib/connected/projects/current.svelte';
	import {
		briefSections,
		joinTech,
		TECH_HEADINGS,
		techSections,
		type TechHeading
	} from '$lib/modules/projects/domain/project';
	import DocSection from '$lib/ui/molecules/DocSection.svelte';
	import ProseField from '$lib/ui/molecules/ProseField.svelte';
	import DocPage from '$lib/ui/organisms/DocPage.svelte';

	const { app, actions } = useApp();
	const project = $derived(currentProject(app));
	const sections = $derived(techSections(project?.techSpec ?? ''));
	const brief = $derived(briefSections(project?.brief ?? ''));

	const HINTS: Record<TechHeading, string> = {
		Performance: 'Temps de réponse maximal, utilisateurs en même temps, volumes dans un an.',
		'Sécurité et données personnelles':
			'Rôles et droits, données sensibles (santé, paiement), chiffrement, RGPD, sauvegardes.',
		'Plateformes et accessibilité':
			'Navigateurs, téléphones, tablettes ; niveau d’accessibilité visé (RGAA, WCAG AA).',
		'Services externes': 'Les API tierces et ce qu’elles coûtent : paiement, SMS, e-mails, cartes…',
		Hébergement: 'Où ça tourne, et les contraintes (hébergeur certifié santé, en France…).',
		Stack: 'Langages, frameworks, base de données.',
		'Environnements et mise en ligne': 'Préprod, prod, et la façon de livrer.',
		'Définition de « fini »':
			'Une liste : ce qui doit être vrai pour qu’une tâche soit finie. Elle s’affiche sur chaque fiche tâche.',
		Conventions: 'Nommage, branches, revues de code.',
		'Après la mise en ligne': 'Qui fait le support, l’accueil des nouveaux clients, la maintenance.'
	};
	/** What the framing note already says, shown where it matters: nothing is typed twice. */
	const FROM_BRIEF: Partial<Record<TechHeading, 'Où' | 'Combien'>> = {
		Performance: 'Combien',
		'Plateformes et accessibilité': 'Où'
	};
	const ids = TECH_HEADINGS.map((h, i) => ({ heading: h, id: `section-${i + 1}` }));
	const save = (heading: TechHeading, text: string) =>
		project &&
		actions.projects.update(project.id, { techSpec: joinTech({ ...sections, [heading]: text }) });
</script>

{#if project}
	<DocPage
		label="Sommaire du cahier des charges technique"
		entries={ids.map(({ heading, id }) => ({ id, label: heading }))}
	>
		{#each ids as { heading, id } (id)}
			{@const from = FROM_BRIEF[heading]}
			<DocSection {id} title={heading}>
				{#if from && brief[from]}
					<p class="rounded-xl bg-plan-soft px-3 py-2 text-sm text-plan-text">
						Repris de « {from} » (note de cadrage) : {brief[from]}
					</p>
				{/if}
				<ProseField
					label={heading}
					value={sections[heading]}
					maxlength={8000}
					placeholder={HINTS[heading]}
					onsave={(text) => save(heading, text)}
				/>
			</DocSection>
		{/each}
	</DocPage>
{/if}
