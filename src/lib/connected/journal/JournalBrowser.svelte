<script lang="ts">
	import { BookOpen, SearchX } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import { ElementSources } from '$lib/client/views/element-sources.svelte';
	import { groupByDay, matchesJournal, NO_FILTER } from '$lib/client/views/journal-timeline';
	import Button from '$lib/ui/atoms/Button.svelte';
	import EmptyState from '$lib/ui/molecules/EmptyState.svelte';
	import JournalToolbar from '$lib/ui/organisms/journal/JournalToolbar.svelte';
	import JournalDays from './JournalDays.svelte';

	let { oncompose }: { oncompose: (kind: 'decision' | 'fix') => void } = $props();
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
		title="Le journal est encore vierge"
		text="Note la prochaine décision qui compte : dans trois mois, tu sauras exactement pourquoi le projet est comme il est."
	>
		<Button variant="primary" size="sm" onclick={() => oncompose('decision')}
			>Noter une décision</Button
		>
	</EmptyState>
{:else}
	<JournalToolbar
		bind:filter
		{counts}
		featureOptions={sources.featureOptions('Toutes les features')}
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
