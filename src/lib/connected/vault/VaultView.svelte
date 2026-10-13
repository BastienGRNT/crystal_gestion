<script lang="ts">
	import { KeyRound, Plus, Search } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { score } from '$lib/client/views/search';
	import type { Project } from '$lib/modules/projects/domain/project';
	import Button from '$lib/ui/atoms/Button.svelte';
	import EmptyState from '$lib/ui/molecules/EmptyState.svelte';
	import VaultCard from './VaultCard.svelte';

	let { project }: { project: Project } = $props();
	const { app, overlays } = useApp();
	let query = $state('');

	const all = $derived(
		app.vault.all
			.filter((e) => e.projectId === project.id)
			.sort((a, b) => a.name.localeCompare(b.name))
	);
	const shown = $derived(
		all.filter(
			(e) => score(`${e.name} ${e.url ?? ''} ${e.username ?? ''} ${e.notes}`, query) !== null
		)
	);
	const open = (entryId?: string) =>
		(overlays.create = { kind: 'vault', projectId: project.id, entryId });
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-wrap items-center gap-2">
		<label class="relative w-full sm:w-80">
			<Search
				size={17}
				class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-3"
				aria-hidden="true"
			/>
			<input
				bind:value={query}
				type="search"
				placeholder="Chercher un accès"
				class="h-11 w-full rounded-xl border border-line-strong/70 bg-surface pr-3 pl-10 text-base shadow-card outline-none focus:border-accent focus:ring-4 focus:ring-accent-soft"
			/>
		</label>
	</div>

	{#if shown.length}
		<div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
			{#each shown as entry (entry.id)}<VaultCard {entry} onedit={() => open(entry.id)} />{/each}
		</div>
	{:else if all.length}
		<EmptyState
			compact
			title="Aucun accès ne correspond"
			text="Essaie le nom du service ou l’adresse du site."
		/>
	{:else}
		<EmptyState
			icon={KeyRound}
			title="Les accès du projet, sans chercher"
			text="Hébergeur, base de données, Stripe, comptes de test… Les mots de passe sont chiffrés et se copient en un clic. Un simple lien marche aussi."
		>
			<Button icon={Plus} onclick={() => open()}>Ajouter un accès</Button>
		</EmptyState>
	{/if}
</div>
