<script lang="ts">
	import { BookOpen, SearchX } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import { ElementSources } from '$lib/client/views/element-sources.svelte';
	import { groupByDay, matchesJournal, NO_FILTER } from '$lib/client/views/journal-timeline';
	import Button from '$lib/ui/atoms/Button.svelte';
	import EmptyState from '$lib/ui/molecules/EmptyState.svelte';
	import JournalToolbar from '$lib/ui/organisms/journal/JournalToolbar.svelte';
	import JournalDays from './JournalDays.svelte';

	const { store } = useProject();
	const sources = new ElementSources(store);
	let filter = $state({ ...NO_FILTER });
	const matching = $derived(
		store.journal.items.filter((e) => matchesJournal(e, { ...filter, kind: 'all' }))
	);
	const count = (kind: string) => matching.filter((entry) => entry.kind === kind).length;
	const counts = $derived({
		all: matching.length,
		decision: count('decision'),
		fix: count('fix'),
		scope: count('scope')
	});
	const shown = $derived(
		matching.filter((entry) => filter.kind === 'all' || entry.kind === filter.kind)
	);
</script>

{#if store.journal.items.length === 0}
	<EmptyState
		icon={BookOpen}
		title="Aucune décision pour l’instant"
		text="Dans la discussion, survole un message et clique sur « Garder comme décision » : elle arrive ici et sur la page de sa Feat."
	>
		<a href="/p/{store.project.slug}/discussion" class="font-bold text-accent-text hover:underline"
			>Aller à la discussion</a
		>
	</EmptyState>
{:else}
	<JournalToolbar
		bind:filter
		{counts}
		featureOptions={sources.featureOptions('Toutes les Feats')}
	/>
	<div class="mt-8">
		{#if shown.length}
			<JournalDays groups={groupByDay(shown)} {sources} />
		{:else}
			<EmptyState icon={SearchX} title="Rien ne correspond" text="Aucune entrée pour ces filtres.">
				<Button size="sm" onclick={() => (filter = { ...NO_FILTER })}
					>Réinitialiser les filtres</Button
				>
			</EmptyState>
		{/if}
	</div>
{/if}
