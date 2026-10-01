<script lang="ts">
	import { Archive, ArchiveRestore } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import { formatDay } from '$lib/client/format';
	import { featureColors } from '$lib/client/views/feature-colors';
	import { isArchived } from '$lib/modules/features/domain/feature';
	import { isOpen } from '$lib/modules/ideas/domain/idea';
	import EmptyState from '$lib/ui/molecules/EmptyState.svelte';
	import Section from '$lib/ui/molecules/Section.svelte';
	import IdeaList from '../ideas/IdeaList.svelte';

	/** What is finished or put away: out of the daily lists, never lost. */
	const { store, actions } = useProject();
	const colorOf = $derived(featureColors(store.features.items));
	const feats = $derived(
		store.features.items
			.filter(isArchived)
			.sort((a, b) => b.archivedAt!.localeCompare(a.archivedAt!))
	);
	const ideas = $derived(store.ideas.items.filter((idea) => !isOpen(idea)));
	const doneCount = (id: string) =>
		store.tasks.items.filter((t) => t.featureId === id && t.status === 'done').length;
</script>

{#if !feats.length && !ideas.length}
	<EmptyState
		icon={Archive}
		title="Rien d’archivé"
		text="Quand toutes les Tasks d’une Feat sont faites, un bouton « Archiver » apparaît sur sa carte."
	/>
{/if}
{#if feats.length}
	<Section title="Feats terminées" count={feats.length}>
		<div class="grid gap-3 md:grid-cols-2">
			{#each feats as feat (feat.id)}
				<div
					class="flex items-center gap-4 rounded-[16px] border-[1.5px] border-line bg-surface p-4"
				>
					<span class="size-4 shrink-0 rounded-[5px]" style="background:{colorOf(feat.id)}"></span>
					<div class="min-w-0 flex-1">
						<a
							href="/p/{store.project.slug}/features/{feat.ref}"
							class="text-[17px] font-extrabold hover:underline">{feat.title}</a
						>
						<p class="text-ui text-ink-3">
							{doneCount(feat.id)} Tasks faites · archivée le {formatDay(feat.archivedAt!, {
								day: 'numeric',
								month: 'long'
							})}
						</p>
					</div>
					<button
						type="button"
						onclick={() => actions.features.archive(feat.id, false)}
						class="inline-flex h-9 items-center gap-2 rounded-[10px] border-[1.5px] border-line-strong px-3 text-ui font-bold hover:border-ink-3"
						><ArchiveRestore size={15} />Restaurer</button
					>
				</div>
			{/each}
		</div>
	</Section>
{/if}
{#if ideas.length}
	<Section title="Idées archivées" count={ideas.length}>
		<div
			class="divide-y-[1.5px] divide-line/70 overflow-hidden rounded-[18px] border-[1.5px] border-line bg-surface"
		>
			<IdeaList {ideas} />
		</div>
	</Section>
{/if}
