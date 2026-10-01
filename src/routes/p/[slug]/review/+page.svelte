<script lang="ts">
	import { ArrowRight, X } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { useProject } from '$lib/client/context';
	import { needsTriage } from '$lib/modules/ideas/domain/idea';
	import FeatureProgress from '$lib/connected/review/FeatureProgress.svelte';
	import IdeaTriage from '$lib/connected/review/IdeaTriage.svelte';
	import OpenQuestions from '$lib/connected/review/OpenQuestions.svelte';
	import StuckTasks from '$lib/connected/review/StuckTasks.svelte';
	import HeaderButton from '$lib/ui/molecules/HeaderButton.svelte';
	import ReviewStepper from '$lib/ui/organisms/review/ReviewStepper.svelte';
	import Page from '$lib/ui/templates/Page.svelte';
	import PageHeader from '$lib/ui/templates/PageHeader.svelte';

	const { store } = useProject();
	const ideasPage = $derived(`/p/${store.project.slug}/ideas`);
	let step = $state(0);
	let stuck = $state(0);
	const questions = $derived(store.questions.items.filter((q) => !q.resolvedAt).length);
	const ideas = $derived(store.ideas.items.filter(needsTriage).length);
	const steps = $derived([
		{
			label: 'Avancement',
			hint: 'Où en sont les features',
			title: 'Où en sont les features ?',
			clear: false
		},
		{
			label: 'Bloqué',
			hint: 'En retard ou au point mort',
			title: 'Qu’est-ce qui bloque ?',
			clear: stuck === 0
		},
		{
			label: 'Questions',
			hint: 'Ce qui attend une réponse',
			title: 'Questions sans réponse',
			clear: questions === 0
		},
		{
			label: 'Idées',
			hint: 'Trier ce qui a été noté',
			title: 'Trier les idées',
			clear: ideas === 0
		}
	]);
	const last = $derived(step === steps.length - 1);
	const next = () => (last ? goto(ideasPage) : (step += 1));
</script>

<svelte:head><title>Revue · {store.project.name}</title></svelte:head>

<PageHeader title="Revue de la semaine" meta="Étape {step + 1} sur 4 · ≈ 10 minutes">
	{#snippet actions()}
		<HeaderButton href={ideasPage}><X size={14} />Quitter</HeaderButton>
	{/snippet}
</PageHeader>
<Page width="max-w-[1000px]">
	<div class="grid items-start gap-7 md:grid-cols-[230px_minmax(0,1fr)]">
		<ReviewStepper {steps} current={step} onpick={(i) => (step = i)} />
		<div class="flex min-w-0 flex-col gap-4">
			<h2 class="text-xl font-semibold tracking-[-0.01em]">{steps[step].title}</h2>
			<!-- Every step stays mounted so « Bloqué » can report its count from the start. -->
			<div class:hidden={step !== 0}><FeatureProgress /></div>
			<div class:hidden={step !== 1}><StuckTasks bind:count={stuck} /></div>
			<div class:hidden={step !== 2}><OpenQuestions /></div>
			<div class:hidden={step !== 3}><IdeaTriage /></div>
			<div class="mt-2 flex justify-between">
				{#if step > 0}
					<button
						type="button"
						onclick={() => (step -= 1)}
						class="h-9 rounded-lg border border-line px-3.5 text-sm font-medium hover:bg-hover"
						>Précédent</button
					>
				{:else}<span></span>{/if}
				<button
					type="button"
					onclick={next}
					class="inline-flex h-9 items-center gap-1.5 rounded-lg bg-accent px-4 text-sm font-medium text-accent-ink"
					>{last ? 'Terminer la revue' : 'Suivant'}<ArrowRight size={15} /></button
				>
			</div>
		</div>
	</div>
</Page>
