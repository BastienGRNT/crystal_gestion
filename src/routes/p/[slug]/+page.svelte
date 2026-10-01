<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { formatDay } from '$lib/client/format';
	import AvailabilityPrompt from '$lib/connected/planning/AvailabilityPrompt.svelte';
	import WhoIsAvailable from '$lib/connected/planning/WhoIsAvailable.svelte';
	import GettingStartedCard from '$lib/connected/today/GettingStartedCard.svelte';
	import Greeting from '$lib/connected/today/Greeting.svelte';
	import MyTasks from '$lib/connected/today/MyTasks.svelte';
	import QuestionsForMe from '$lib/connected/today/QuestionsForMe.svelte';
	import Recap from '$lib/connected/today/Recap.svelte';
	import Card from '$lib/ui/molecules/Card.svelte';
	import Section from '$lib/ui/molecules/Section.svelte';
	import Page from '$lib/ui/templates/Page.svelte';
	import PageHeader from '$lib/ui/templates/PageHeader.svelte';

	let { data } = $props();
	const { store } = useProject();
	const today = formatDay(new Date());
</script>

<svelte:head><title>Aujourd’hui · {store.project.name}</title></svelte:head>

<PageHeader title="Aujourd’hui" meta={today[0].toUpperCase() + today.slice(1)} />
<Page>
	<div class="flex flex-wrap items-start gap-8">
		<div class="flex min-w-0 flex-[999_1_560px] flex-col gap-5">
			<Greeting />
			<GettingStartedCard />
			<MyTasks />
			<Section title="Ce qui a bougé depuis ta dernière visite"
				><Recap recapSince={data.recapSince} /></Section
			>
		</div>
		<aside class="flex max-w-full min-w-0 flex-[1_1_300px] flex-col gap-4">
			<AvailabilityPrompt />
			<Card
				title="Questions pour toi"
				link={{ label: 'Discussion', href: `/p/${store.project.slug}/discussion` }}
				><QuestionsForMe /></Card
			>
			<WhoIsAvailable />
		</aside>
	</div>
</Page>
