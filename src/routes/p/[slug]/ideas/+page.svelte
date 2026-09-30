<script lang="ts">
	import { Sparkles } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import { isOpen, needsTriage } from '$lib/modules/ideas/domain/idea';
	import IdeaCaptureBox from '$lib/connected/ideas/IdeaCaptureBox.svelte';
	import IdeaList from '$lib/connected/ideas/IdeaList.svelte';
	import WontFeatures from '$lib/connected/ideas/WontFeatures.svelte';
	import Button from '$lib/ui/atoms/Button.svelte';
	import EmptyState from '$lib/ui/molecules/EmptyState.svelte';
	import IdeaSection from '$lib/ui/organisms/ideas/IdeaSection.svelte';
	import Page from '$lib/ui/templates/Page.svelte';
	import PageHeader from '$lib/ui/templates/PageHeader.svelte';

	const { store } = useProject();
	let showArchived = $state(false);
	const open = $derived(store.ideas.items.filter(isOpen));
	const archived = $derived(store.ideas.items.filter((idea) => !isOpen(idea)));
	const untriaged = $derived(open.filter(needsTriage).length);
</script>

<Page width="max-w-6xl">
	<PageHeader
		eyebrow="Chaque semaine"
		title="Idées"
		subtitle="Tout ce qui n’est pas pour maintenant. Note-la en une ligne (touche I, partout) : on la transforme en tâche ou en feature pendant la revue."
	/>
	<IdeaCaptureBox />
	<div class="mt-12 grid gap-x-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
		<div class="min-w-0">
			<IdeaSection
				title="En attente"
				count={open.length}
				hint={untriaged ? `dont ${untriaged} à trier à la revue` : undefined}
			>
				{#if open.length}
					<IdeaList ideas={open} />
				{:else}
					<div class="pt-4">
						<EmptyState
							icon={Sparkles}
							title="Rien en attente"
							text="Toutes les idées sont triées. La prochaine qui te traverse l’esprit : tape-la au-dessus."
						/>
					</div>
				{/if}
			</IdeaSection>
		</div>
		<div class="min-w-0">
			<WontFeatures />
			{#if archived.length}
				<IdeaSection title="Archivées" count={archived.length}>
					{#snippet aside()}
						<Button variant="ghost" size="sm" onclick={() => (showArchived = !showArchived)}
							>{showArchived ? 'Masquer' : 'Afficher'}</Button
						>
					{/snippet}
					{#if showArchived}<IdeaList ideas={archived} />{/if}
				</IdeaSection>
			{/if}
		</div>
	</div>
</Page>
