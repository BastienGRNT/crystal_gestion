<script lang="ts">
	import { page } from '$app/state';
	import { useProject } from '$lib/client/context';
	import Features from '$lib/connected/project/Features.svelte';
	import Framing from '$lib/connected/project/Framing.svelte';
	import ProjectTabs from '$lib/connected/project/ProjectTabs.svelte';
	import Team from '$lib/connected/project/Team.svelte';
	import InlineText from '$lib/ui/molecules/InlineText.svelte';
	import Section from '$lib/ui/molecules/Section.svelte';
	import Page from '$lib/ui/templates/Page.svelte';

	let { data } = $props();
	const { store, actions } = useProject();
	const welcome = $derived(page.url.searchParams.has('welcome'));
</script>

<svelte:head><title>Projet · {store.project.name}</title></svelte:head>

<Page>
	<p class="mb-2.5 font-mono text-2xs font-medium tracking-[0.14em] text-ink-3 uppercase">Projet</p>
	<InlineText
		value={store.project.name}
		onsave={(name) => actions.project.updateFraming({ name })}
		class="font-display text-4xl sm:text-5xl"
	/>
	<p class="mt-3 mb-6 max-w-2xl text-lg text-ink-2">
		Pourquoi on le fait, ce qu’on construit, et avec qui. Tout se modifie en cliquant dessus.
	</p>
	<ProjectTabs value="overview" />
	{#if welcome}
		<p
			class="mb-8 animate-rise rounded-lg border border-accent/30 bg-accent-soft/60 px-4 py-3 text-base"
		>
			Projet créé : la discussion <strong>Général</strong>, le tableau des tâches et les dossiers
			sont prêts. Écris l’objectif, ajoute tes features puis invite ton équipe.
		</p>
	{/if}
	<div class="grid gap-x-12 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]">
		<div class="min-w-0">
			<div class="mb-12"><Framing /></div>
			<Section title="Features" count={store.features.items.length}><Features /></Section>
		</div>
		<aside class="min-w-0" id="equipe">
			<Section title="Équipe" count={store.members.items.length}
				><Team users={data.users} /></Section
			>
		</aside>
	</div>
</Page>
