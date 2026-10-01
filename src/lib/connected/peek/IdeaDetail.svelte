<script lang="ts">
	import { Archive, ArchiveRestore, Trash2 } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import type { ElementSummary } from '$lib/modules/kernel/domain/element';
	import Button from '$lib/ui/atoms/Button.svelte';
	import InlineRichText from '$lib/ui/molecules/InlineRichText.svelte';
	import InlineText from '$lib/ui/molecules/InlineText.svelte';
	import Backlinks from '../Backlinks.svelte';
	import { ideaHandlers } from '../ideas/handlers';
	import ElementTalk from './ElementTalk.svelte';
	import IdeaProperties from './IdeaProperties.svelte';

	let { element, onclose }: { element: ElementSummary; onclose: () => void } = $props();
	const context = useProject();
	const { store, actions, refs } = context;
	const idea = $derived(store.ideas.get(element.id));
	const handlers = $derived(ideaHandlers(context, element.id));
	const convert =
		'inline-flex h-8 items-center rounded-lg border border-line px-3 text-ui font-medium transition hover:bg-hover';
</script>

{#if idea}
	<InlineText
		value={idea.title}
		onsave={(title) => actions.ideas.update(idea.id, { title })}
		class="text-xl leading-snug font-semibold tracking-[-0.01em]"
	/>
	<div class="mt-4 flex flex-wrap items-center gap-2">
		{#if idea.archivedAt}
			<button type="button" class={convert} onclick={() => handlers.onarchive(false)}
				><ArchiveRestore size={14} class="mr-1.5" />Restaurer</button
			>
		{:else}
			<button type="button" class={convert} onclick={handlers.ontask}>En faire une tâche</button>
			<button type="button" class={convert} onclick={handlers.onfeature}
				>En faire une feature</button
			>
			<button
				type="button"
				class="{convert} border-transparent text-ink-3"
				onclick={() => handlers.onarchive(true)}
				><Archive size={14} class="mr-1.5" />Archiver</button
			>
		{/if}
	</div>
	<div class="mt-4 -ml-1"><IdeaProperties {idea} /></div>
	<div class="mt-5">
		<InlineRichText
			value={idea.note}
			resolve={refs.resolve}
			suggest={refs.suggest}
			placeholder="Développer l’idée…"
			onsave={(note) => actions.ideas.update(idea.id, { note })}
		/>
	</div>
	<div class="mt-6 border-t border-line pt-5">
		<ElementTalk element={idea} featureId={idea.featureId} />
	</div>
	<Backlinks id={idea.id} except="message" framed />
	<div class="mt-6 flex justify-end">
		<Button variant="ghost" size="sm" onclick={() => (handlers.onremove(), onclose())}
			><Trash2 size={13} /> Supprimer</Button
		>
	</div>
{/if}
