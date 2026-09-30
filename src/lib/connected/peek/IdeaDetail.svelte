<script lang="ts">
	import { Archive, ArchiveRestore, ArrowRight, Trash2 } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import type { ElementSummary } from '$lib/modules/kernel/domain/element';
	import Button from '$lib/ui/atoms/Button.svelte';
	import IconButton from '$lib/ui/atoms/IconButton.svelte';
	import DetailSection from '$lib/ui/molecules/DetailSection.svelte';
	import InlineRichText from '$lib/ui/molecules/InlineRichText.svelte';
	import InlineText from '$lib/ui/molecules/InlineText.svelte';
	import Backlinks from '../Backlinks.svelte';
	import { ideaHandlers } from '../ideas/handlers';
	import IdeaProperties from './IdeaProperties.svelte';

	let { element, onclose }: { element: ElementSummary; onclose: () => void } = $props();
	const context = useProject();
	const { store, actions, refs } = context;
	const idea = $derived(store.ideas.get(element.id));
	const handlers = $derived(ideaHandlers(context, element.id));
</script>

{#if idea}
	<InlineText
		value={idea.title}
		onsave={(title) => actions.ideas.update(idea.id, { title })}
		class="font-display text-3xl leading-tight"
	/>
	<div class="mt-4 flex flex-wrap items-center gap-2">
		{#if idea.archivedAt}
			<Button size="sm" onclick={() => handlers.onarchive(false)}
				><ArchiveRestore size={13} /> Désarchiver</Button
			>
		{:else}
			<span class="text-sm text-ink-3">Transformer en</span>
			<Button variant="primary" size="sm" onclick={handlers.ontask}
				><ArrowRight size={13} /> Tâche</Button
			>
			<Button size="sm" onclick={handlers.onfeature}><ArrowRight size={13} /> Feature</Button>
			<Button variant="ghost" size="sm" onclick={() => handlers.onarchive(true)}
				><Archive size={13} /> Archiver</Button
			>
		{/if}
		<IconButton
			label="Supprimer l’idée"
			class="ml-auto"
			onclick={() => (handlers.onremove(), onclose())}><Trash2 size={15} /></IconButton
		>
	</div>
	<div class="mt-6"><IdeaProperties {idea} /></div>
	<div class="mt-6 flex flex-col gap-6">
		<DetailSection label="Note">
			<InlineRichText
				value={idea.note}
				resolve={refs.resolve}
				suggest={refs.suggest}
				placeholder="Développer l’idée, lier des éléments avec #…"
				onsave={(note) => actions.ideas.update(idea.id, { note })}
			/>
		</DetailSection>
		<div class="border-t border-line pt-5"><Backlinks id={idea.id} /></div>
	</div>
{/if}
