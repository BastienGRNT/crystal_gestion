<script lang="ts">
	import { useProject } from '$lib/client/context';
	import MyTodo from '$lib/connected/tasks/MyTodo.svelte';
	import Greeting from '$lib/connected/today/Greeting.svelte';
	import QuestionsForMe from '$lib/connected/today/QuestionsForMe.svelte';
	import Recap from '$lib/connected/today/Recap.svelte';
	import Section from '$lib/ui/molecules/Section.svelte';
	import Page from '$lib/ui/templates/Page.svelte';

	let { data } = $props();
	const { store } = useProject();
</script>

<svelte:head><title>Aujourd’hui · {store.project.name}</title></svelte:head>

<Page width="max-w-6xl">
	<Greeting />
	<div class="grid gap-x-12 lg:grid-cols-[minmax(0,1fr)_340px]">
		<div class="min-w-0">
			<Section title="Mes tâches">
				{#snippet action()}<a href="/p/{store.project.slug}/tasks" class="text-ink-3 hover:text-accent">Tout voir →</a>{/snippet}
				<MyTodo limitDone={3} />
			</Section>
			<Section title="Depuis ta dernière visite"><Recap recapSince={data.recapSince} /></Section>
		</div>
		<aside class="min-w-0">
			<Section title="Questions pour toi"><QuestionsForMe /></Section>
		</aside>
	</div>
</Page>
