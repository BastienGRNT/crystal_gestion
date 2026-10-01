<script lang="ts">
	import { Trash2 } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import type { ElementSummary } from '$lib/modules/kernel/domain/element';
	import Button from '$lib/ui/atoms/Button.svelte';
	import InlineText from '$lib/ui/molecules/InlineText.svelte';
	import Backlinks from '../Backlinks.svelte';
	import JournalProperties from './JournalProperties.svelte';
	import JournalTexts from './JournalTexts.svelte';
	import ElementTalk from './ElementTalk.svelte';

	let { element, onclose }: { element: ElementSummary; onclose: () => void } = $props();
	const { store, actions } = useProject();
	const entry = $derived(store.journal.get(element.id));
</script>

{#if entry}
	<InlineText
		value={entry.title}
		onsave={(title) => actions.journal.update(entry.id, { title })}
		class="text-xl leading-snug font-semibold tracking-[-0.01em]"
	/>
	<div class="mt-3 flex items-center gap-2">
		{#if entry.kind === 'scope'}<span class="text-sm text-ink-3">Consigné automatiquement</span
			>{/if}
		<Button
			variant="ghost"
			size="sm"
			class="ml-auto"
			onclick={() => (actions.journal.remove(entry.id), onclose())}
			><Trash2 size={13} /> Supprimer</Button
		>
	</div>
	<div class="mt-4"><JournalProperties {entry} /></div>
	<div class="mt-6 flex flex-col gap-6">
		<JournalTexts {entry} />
		<div class="border-t border-line pt-5">
			<ElementTalk element={entry} featureId={entry.featureId} />
		</div>
		<Backlinks id={entry.id} except="message" framed />
	</div>
{/if}
