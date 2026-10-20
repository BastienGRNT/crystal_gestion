<script lang="ts">
	import { useApp } from '$lib/client/context';
	import { shortDay } from '$lib/client/format';
	import { howText, whenText } from '$lib/client/views/framing';
	import {
		BRIEF_HEADINGS,
		briefSections,
		joinBrief,
		type BriefHeading,
		type Project
	} from '$lib/modules/projects/domain/project';
	import { currentMilestone } from '$lib/modules/roadmap/domain/milestone';
	import ProseField from '$lib/ui/molecules/ProseField.svelte';

	let { project }: { project: Project } = $props();
	const { app, actions } = useApp();

	const sections = $derived(briefSections(project.brief));
	const base = $derived(`/p/${project.slug}`);
	const step = $derived(
		currentMilestone(app.milestones.all.filter((m) => m.projectId === project.id))
	);
	const how = $derived(howText(project));

	const QUESTIONS: Record<BriefHeading, string> = {
		Pourquoi: 'Quel problème, et ce qu’il leur coûte aujourd’hui (temps, argent, clients perdus).',
		Qui: 'Qui utilise, qui décide, qui paie. Précis : « kinés seuls ou à deux », pas « les pros ».',
		Quoi: 'Ce qu’on fait de différent, en une ou deux phrases, et les 3 choses que la v1 doit faire.',
		'Ce qu’on ne fait pas': 'Ce qu’on refuse, et jusqu’à quand : ça coupe court aux débats.',
		Où: 'Sur quoi et dans quel contexte on s’en sert : téléphone, au cabinet, hors ligne…',
		Combien: 'Les volumes : utilisateurs, rendez-vous par jour, données. Au départ, et dans un an.'
	};
	const save = (heading: BriefHeading, text: string) =>
		actions.projects.update(project.id, { brief: joinBrief({ ...sections, [heading]: text }) });
</script>

{#snippet row(heading: string, question: string)}
	<dt class="pt-1.5 text-sm font-semibold text-ink-2 sm:w-36 sm:shrink-0" title={question}>
		{heading}
	</dt>
{/snippet}

<dl
	class="flex flex-col divide-y divide-line rounded-2xl border border-line bg-surface shadow-card"
>
	{#each BRIEF_HEADINGS.slice(0, 5) as heading (heading)}
		<div class="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-4">
			{@render row(heading, QUESTIONS[heading])}
			<dd class="min-w-0 flex-1">
				<ProseField
					label={heading}
					value={sections[heading]}
					maxlength={4000}
					placeholder={QUESTIONS[heading]}
					onsave={(text) => save(heading, text)}
				/>
			</dd>
		</div>
		{#if heading === 'Où'}
			<!-- "Quand" is never typed: the delivery date and the steps say it. -->
			<div class="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-4">
				{@render row('Quand', 'La date de livraison et les étapes')}
				<dd class="min-w-0 flex-1 py-1.5 text-base text-ink-2">
					{whenText(project, step, shortDay)} ·
					<a href="{base}/feuille-de-route" class="text-accent-text hover:underline"
						>la feuille de route</a
					>
				</dd>
			</div>
			<div class="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-4">
				{@render row('Comment', 'La stack et l’hébergement')}
				<dd class="min-w-0 flex-1 py-1.5 text-base text-ink-2">
					{how || 'Pas encore écrit'} ·
					<a href="{base}/cadrage/technique" class="text-accent-text hover:underline"
						>le cahier des charges technique</a
					>
				</dd>
			</div>
		{/if}
	{/each}
	<div class="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-4">
		{@render row('Combien', QUESTIONS.Combien)}
		<dd class="min-w-0 flex-1">
			<ProseField
				label="Combien"
				value={sections.Combien}
				maxlength={4000}
				placeholder={QUESTIONS.Combien}
				onsave={(text) => save('Combien', text)}
			/>
		</dd>
	</div>
</dl>
