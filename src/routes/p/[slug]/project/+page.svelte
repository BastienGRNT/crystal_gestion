<script lang="ts">
	import { page } from '$app/state';
	import { useProject } from '$lib/client/context';
	import Framing from '$lib/connected/project/Framing.svelte';
	import ProjectTabs from '$lib/connected/project/ProjectTabs.svelte';
	import Team from '$lib/connected/project/Team.svelte';
	import InlineText from '$lib/ui/molecules/InlineText.svelte';
	import Section from '$lib/ui/molecules/Section.svelte';
	import Page from '$lib/ui/templates/Page.svelte';
	import PageHeader from '$lib/ui/templates/PageHeader.svelte';

	let { data } = $props();
	const { store, actions } = useProject();
	const welcome = $derived(page.url.searchParams.has('welcome'));
</script>

<svelte:head><title>Projet · {store.project.name}</title></svelte:head>

<PageHeader title="Features">
	{#snippet actions()}<ProjectTabs value="overview" />{/snippet}
</PageHeader>
<Page width="max-w-[1100px]">
	<InlineText
		value={store.project.name}
		onsave={(name) => actions.project.updateFraming({ name })}
		class="font-display text-2xl"
	/>
	<p class="mt-1 mb-6 text-sm text-ink-2">
		Pourquoi on le fait, et avec qui. Tout se modifie en cliquant dessus.
	</p>
	{#if welcome}
		<p
			class="mb-8 animate-rise rounded-lg border border-accent/30 bg-accent-soft/60 px-4 py-3 text-base"
		>
			Projet créé : la discussion <strong>Général</strong>, le tableau des tâches et les dossiers
			sont prêts. Écris l’objectif, ajoute tes features (onglet Features) puis invite ton équipe.
		</p>
	{/if}
	<div class="grid gap-x-12 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]">
		<div class="min-w-0">
			<Framing />
		</div>
		<aside class="min-w-0" id="equipe">
			<Section title="Équipe" count={store.members.items.length}
				><Team users={data.users} /></Section
			>
		</aside>
	</div>
</Page>
