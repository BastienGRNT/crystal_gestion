<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { formatDay } from '$lib/client/format';
	import AvailabilityPrompt from '$lib/connected/planning/AvailabilityPrompt.svelte';
	import WhoIsAvailable from '$lib/connected/planning/WhoIsAvailable.svelte';
	import GettingStartedCard from '$lib/connected/today/GettingStartedCard.svelte';
	import Greeting from '$lib/connected/today/Greeting.svelte';
	import MyMatrix from '$lib/connected/today/MyMatrix.svelte';
	import TalkedToYou from '$lib/connected/today/TalkedToYou.svelte';
	import WhereYouWere from '$lib/connected/today/WhereYouWere.svelte';
	import WhileAway from '$lib/connected/today/WhileAway.svelte';
	import Section from '$lib/ui/molecules/Section.svelte';
	import Page from '$lib/ui/templates/Page.svelte';
	import PageHeader from '$lib/ui/templates/PageHeader.svelte';

	let { data } = $props();
	const { store } = useProject();
	const today = formatDay(new Date());
</script>

<svelte:head><title>Accueil · {store.project.name}</title></svelte:head>

<PageHeader title="Accueil" meta={today[0].toUpperCase() + today.slice(1)} />
<Page width="max-w-[1320px]">
	<Greeting recapSince={data.recapSince} />
	<div class="mt-7 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
		<div class="flex min-w-0 flex-col gap-6">
			<GettingStartedCard />
			<WhereYouWere />
			<Section title="Ta matrice">
				{#snippet action()}Glisse une tâche d’une case à l’autre pour la reclasser{/snippet}
				<MyMatrix />
			</Section>
		</div>
		<aside class="flex min-w-0 flex-col gap-4">
			<TalkedToYou />
			<WhileAway recapSince={data.recapSince} />
			<AvailabilityPrompt />
			<WhoIsAvailable />
		</aside>
	</div>
</Page>
