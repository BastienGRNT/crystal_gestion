<script lang="ts">
	import { X } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { useProject } from '$lib/client/context';
	import { toasts } from '$lib/client/toasts.svelte';
	import { needsTriage } from '$lib/modules/ideas/domain/idea';
	import DoneToday from '$lib/connected/review/DoneToday.svelte';
	import FeatureProgress from '$lib/connected/review/FeatureProgress.svelte';
	import IdeaTriage from '$lib/connected/review/IdeaTriage.svelte';
	import OpenQuestions from '$lib/connected/review/OpenQuestions.svelte';
	import PlanTomorrow from '$lib/connected/review/PlanTomorrow.svelte';
	import ReviewFlow from '$lib/connected/review/ReviewFlow.svelte';
	import StuckTasks from '$lib/connected/review/StuckTasks.svelte';
	import HeaderButton from '$lib/ui/molecules/HeaderButton.svelte';
	import LinkSegments from '$lib/ui/molecules/LinkSegments.svelte';
	import Page from '$lib/ui/templates/Page.svelte';
	import PageHeader from '$lib/ui/templates/PageHeader.svelte';

	const { store } = useProject();
	const home = $derived(`/p/${store.project.slug}`);
	const daily = $derived(page.url.searchParams.get('mode') === 'day');
	let stuck = $state(0);
	let myStuck = $state(0);
	const questions = $derived(store.questions.items.filter((q) => !q.resolvedAt).length);
	const ideas = $derived(store.ideas.items.filter(needsTriage).length);
	const finish = (message: string) => (toasts.show(message, 'success'), goto(home));
	const dailySteps = $derived([
		{ label: 'Aujourd’hui', hint: 'Ce que tu as fait', title: 'Ta journée', clear: false },
		{
			label: 'Bloqué',
			hint: 'En retard, pas bougé',
			title: 'Qu’est-ce qui coince ?',
			clear: myStuck === 0
		},
		{ label: 'Demain', hint: 'Choisir 1 à 3 Tasks', title: 'Demain, tu fais quoi ?', clear: false }
	]);
	const weeklySteps = $derived([
		{
			label: 'Avancement',
			hint: 'Où en sont les Feats',
			title: 'Où en sont les Feats ?',
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
</script>

<svelte:head><title>Faire le point · {store.project.name}</title></svelte:head>

<PageHeader title="Faire le point" meta={daily ? '≈ 2 minutes' : '≈ 10 minutes'}>
	{#snippet actions()}
		<LinkSegments
			label="Quel point"
			value={daily ? 'day' : 'week'}
			tabs={[
				{ value: 'day', label: 'Du jour', href: '?mode=day' },
				{ value: 'week', label: 'De la semaine', href: '?mode=week' }
			]}
		/>
		<HeaderButton href={home}><X size={14} />Quitter</HeaderButton>
	{/snippet}
</PageHeader>
<Page width="max-w-[1000px]">
	{#key daily}
		{#if daily}
			<ReviewFlow
				steps={dailySteps}
				panels={[doneToday, myBlocked, tomorrow]}
				finishLabel="C’est noté, à demain"
				onfinish={() => finish('Point du jour fait. Bonne soirée !')}
			/>
		{:else}
			<ReviewFlow
				steps={weeklySteps}
				panels={[progress, blocked, open, triage]}
				finishLabel="Terminer la revue"
				onfinish={() => finish('Revue de la semaine terminée.')}
			/>
		{/if}
	{/key}
</Page>

{#snippet doneToday()}<DoneToday />{/snippet}
{#snippet myBlocked()}<StuckTasks mine bind:count={myStuck} />{/snippet}
{#snippet tomorrow()}<PlanTomorrow />{/snippet}
{#snippet progress()}<FeatureProgress />{/snippet}
{#snippet blocked()}<StuckTasks bind:count={stuck} />{/snippet}
{#snippet open()}<OpenQuestions />{/snippet}
{#snippet triage()}<IdeaTriage />{/snippet}
