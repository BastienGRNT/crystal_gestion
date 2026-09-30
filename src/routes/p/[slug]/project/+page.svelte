<script lang="ts">
	import { page } from '$app/state';
	import { Sparkles } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import Features from '$lib/connected/project/Features.svelte';
	import Framing from '$lib/connected/project/Framing.svelte';
	import Team from '$lib/connected/project/Team.svelte';
	import InlineText from '$lib/ui/molecules/InlineText.svelte';
	import Section from '$lib/ui/molecules/Section.svelte';
	import Page from '$lib/ui/templates/Page.svelte';

	let { data } = $props();
	const { store, actions } = useProject();
	const welcome = $derived(page.url.searchParams.has('welcome'));
</script>

<svelte:head><title>Projet · {store.project.name}</title></svelte:head>

<Page width="max-w-6xl">
	<p class="mb-3 font-mono text-2xs tracking-[0.14em] text-ink-3 uppercase">Cadrage</p>
	<InlineText
		value={store.project.name}
		onsave={(name) => actions.project.updateFraming({ name })}
		class="font-display text-5xl leading-none sm:text-6xl"
	/>
	{#if welcome}
		<p
			class="mt-5 animate-rise rounded-lg border border-accent/30 bg-accent-soft/60 px-4 py-3 text-base"
		>
			Projet créé : le canal <strong>#général</strong>, le tableau et les dossiers sont prêts.
			Ajoute tes features et invite ton équipe.
		</p>
	{/if}
	<div class="mt-8 grid gap-x-12 lg:grid-cols-[minmax(0,1fr)_320px]">
		<div class="min-w-0">
			<div class="mb-12"><Framing /></div>
			<Section title="Features" count={store.features.items.length}><Features /></Section>
		</div>
		<aside class="min-w-0">
			<Section title="Équipe" count={store.members.items.length}
				><Team users={data.users} /></Section
			>
			<a
				href="/p/{store.project.slug}/ai"
				class="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink-2 transition hover:border-accent hover:text-accent"
			>
				<Sparkles size={14} /> Ce que l’IA sait du projet
			</a>
		</aside>
	</div>
</Page>
