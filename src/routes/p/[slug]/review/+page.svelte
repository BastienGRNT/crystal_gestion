<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { formatDay } from '$lib/client/format';
	import { startOfWeek } from '$lib/modules/kernel/domain/week';
	import { needsTriage } from '$lib/modules/ideas/domain/idea';
	import FeatureProgress from '$lib/connected/review/FeatureProgress.svelte';
	import IdeaTriage from '$lib/connected/review/IdeaTriage.svelte';
	import OpenQuestions from '$lib/connected/review/OpenQuestions.svelte';
	import StuckTasks from '$lib/connected/review/StuckTasks.svelte';
	import ReviewStep from '$lib/ui/organisms/review/ReviewStep.svelte';
	import Page from '$lib/ui/templates/Page.svelte';
	import PageHeader from '$lib/ui/templates/PageHeader.svelte';

	const { store } = useProject();
	let stuck = $state(0);
	const questions = $derived(store.questions.items.filter((q) => !q.resolvedAt).length);
	const ideas = $derived(store.ideas.items.filter(needsTriage).length);
	const week = `Semaine du ${formatDay(startOfWeek(new Date()), { day: 'numeric', month: 'long' })}`;
</script>

<svelte:head><title>Revue · {store.project.name}</title></svelte:head>

<Page width="max-w-4xl">
	<PageHeader eyebrow="{week} · ≈ 10 minutes" title="Revue de la semaine" subtitle="Quatre étapes pour repartir au clair : où on en est, ce qui coince, ce qui attend une réponse, ce qu’on garde." />
	<ReviewStep index={1} title="Avancement" hint="Par feature, avec les tâches terminées cette semaine (+n)." clear={false}><FeatureProgress /></ReviewStep>
	<ReviewStep index={2} title="Bloqué ou en retard" hint="Échéance dépassée, ou en cours sans mouvement depuis une semaine." clear={stuck === 0}><StuckTasks bind:count={stuck} /></ReviewStep>
	<ReviewStep index={3} title="Questions sans réponse" hint="Qui attend quoi, et depuis quand." clear={questions === 0}><OpenQuestions /></ReviewStep>
	<ReviewStep index={4} title="Idées à trier" hint="Transformer en tâche ou en feature, garder pour plus tard, ou supprimer." clear={ideas === 0}><IdeaTriage /></ReviewStep>
</Page>
