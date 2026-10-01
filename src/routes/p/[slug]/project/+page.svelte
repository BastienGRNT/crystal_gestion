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

<PageHeader
	title="Le projet"
	meta="Pourquoi on le fait, et avec qui. Tout se modifie en cliquant dessus."
>
	{#snippet tabs()}<ProjectTabs value="overview" />{/snippet}
</PageHeader>
<Page width="max-w-[1100px]">
	<InlineText
		value={store.project.name}
		onsave={(name) => actions.project.updateFraming({ name })}
		class="font-display text-2xl"
	/>
	<div class="mb-6"></div>
	{#if welcome}
		<p
			class="mb-8 animate-rise rounded-lg border border-accent/30 bg-accent-soft/60 px-4 py-3 text-base"
		>
			Projet créé : la discussion <strong>Général</strong>, le tableau des Tasks et les dossiers
			sont prêts. Écris l’objectif, ajoute tes Feats (dans Gestion) puis invite ton équipe.
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
	<a
		href="/p/{store.project.slug}/ai"
		class="mt-10 inline-block text-xs text-ink-3 hover:text-ink hover:underline"
		>Mémoire IA : ce que l’IA saura du projet →</a
	>
</Page>
