<script lang="ts">
	import { useProject } from '$lib/client/context';
	import AvailabilityPrompt from '$lib/connected/planning/AvailabilityPrompt.svelte';
	import WhoIsAvailable from '$lib/connected/planning/WhoIsAvailable.svelte';
	import MyTodo from '$lib/connected/tasks/MyTodo.svelte';
	import GettingStartedCard from '$lib/connected/today/GettingStartedCard.svelte';
	import Greeting from '$lib/connected/today/Greeting.svelte';
	import QuestionsForMe from '$lib/connected/today/QuestionsForMe.svelte';
	import Recap from '$lib/connected/today/Recap.svelte';
	import Section from '$lib/ui/molecules/Section.svelte';
	import Page from '$lib/ui/templates/Page.svelte';

	let { data } = $props();
	const { store } = useProject();
</script>

<svelte:head><title>Aujourd’hui · {store.project.name}</title></svelte:head>

<Page>
	<Greeting />
	<GettingStartedCard />
	<div class="grid gap-x-10 gap-y-2 lg:grid-cols-[minmax(0,1fr)_minmax(320px,400px)] xl:gap-x-14">
		<div class="min-w-0">
			<Section title="Mes tâches">
				{#snippet action()}<a
						href="/p/{store.project.slug}/tasks"
						class="text-accent-text hover:underline">Toutes les tâches →</a
					>{/snippet}
				<MyTodo limitDone={3} />
			</Section>
			<Section title="Depuis ta dernière visite"><Recap recapSince={data.recapSince} /></Section>
		</div>
		<aside class="min-w-0">
			<div class="mb-10"><AvailabilityPrompt /></div>
			<Section title="Questions pour toi"><QuestionsForMe /></Section>
			<Section title="Qui est dispo aujourd’hui"><WhoIsAvailable /></Section>
		</aside>
	</div>
</Page>
