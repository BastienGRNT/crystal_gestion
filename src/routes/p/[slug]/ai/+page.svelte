<script lang="ts">
	import { BookOpen, Gem, Target } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import { timeAgo } from '$lib/client/format';
	import QuickAdd from '$lib/ui/molecules/QuickAdd.svelte';
	import Section from '$lib/ui/molecules/Section.svelte';
	import NoteCard from '$lib/ui/organisms/NoteCard.svelte';
	import Page from '$lib/ui/templates/Page.svelte';
	import PageHeader from '$lib/ui/templates/PageHeader.svelte';
	import ProjectTabs from '$lib/connected/project/ProjectTabs.svelte';

	const { store, actions } = useProject();
	const author = (id: string | null) => (id ? (store.members.get(id)?.name ?? 'Quelqu’un') : 'IA');
	const sources = $derived([
		{ icon: Target, label: 'Projet', value: 'objectif, public, périmètre, « c’est fini quand »' },
		{
			icon: Gem,
			label: 'Features',
			value: `${store.features.items.length} avec priorités et critères`
		},
		{
			icon: BookOpen,
			label: 'Journal',
			value: `${store.journal.items.length} décisions, bugs résolus et changements`
		}
	]);
</script>

<svelte:head><title>Mémoire IA · {store.project.name}</title></svelte:head>

<PageHeader title="Features">
	{#snippet actions()}<ProjectTabs value="ai" />{/snippet}
</PageHeader>
<Page width="max-w-[1000px]">
	<p class="mb-6 text-sm text-ink-2">
		Les notes que l’IA ajoutera au fil du temps (conventions, qui fait quoi, erreurs à ne pas
		refaire). Tout est visible, modifiable et supprimable par l’équipe.
	</p>
	<Section title="Notes" count={store.aiNotes.items.length}>
		<ul>
			{#each store.aiNotes.items as note (note.id)}
				<NoteCard
					content={note.content}
					source={note.source}
					meta="{note.source === 'ai'
						? 'Ajoutée par l’IA'
						: `Ajoutée par ${author(note.createdBy)}`} · {timeAgo(note.updatedAt)}"
					onsave={(content) => actions.project.updateNote(note.id, content)}
					ondelete={() => actions.project.removeNote(note.id)}
				/>
			{/each}
		</ul>
		<div class="mt-3">
			<QuickAdd
				placeholder="Ajouter une note (ex. « on déploie le dimanche soir »)"
				onadd={(content) => actions.project.createNote(content)}
			/>
		</div>
	</Section>
	<Section title="Ce qu’elle lit aussi">
		<div class="grid gap-3 sm:grid-cols-3">
			{#each sources as source (source.label)}
				<div class="rounded-lg border border-line bg-surface p-3.5">
					<source.icon size={16} class="text-accent" />
					<p class="mt-2 font-medium">{source.label}</p>
					<p class="text-sm text-ink-3">{source.value}</p>
				</div>
			{/each}
		</div>
		<p class="mt-4 text-sm text-ink-3">
			Aucun fournisseur d’IA n’est branché pour l’instant : les résumés et suggestions arriveront
			dans une prochaine version.
		</p>
	</Section>
</Page>
