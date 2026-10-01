<script lang="ts">
	import { useProject } from '$lib/client/context';
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

	let { data } = $props();
	const { store } = useProject();
</script>

<svelte:head><title>Accueil · {store.project.name}</title></svelte:head>

<Greeting recapSince={data.recapSince} />
<Page width="max-w-[1400px]">
	<div class="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
		<div class="flex min-w-0 flex-col gap-6">
			<GettingStartedCard />
			<WhereYouWere />
			<Section title="Ta matrice">
				{#snippet action()}<span class="max-sm:hidden"
						>Glisse une Task d’une case à l’autre pour la reclasser</span
					>{/snippet}
				<MyMatrix />
			</Section>
		</div>
		<aside class="flex min-w-0 flex-col gap-5">
			<TalkedToYou />
			<WhileAway recapSince={data.recapSince} />
			<AvailabilityPrompt />
			<WhoIsAvailable />
		</aside>
	</div>
</Page>
