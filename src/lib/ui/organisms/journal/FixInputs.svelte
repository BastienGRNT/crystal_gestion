<script lang="ts">
	import type { JournalDraft } from '$lib/client/views/journal-draft';
	import LabeledRefArea from '../../molecules/LabeledRefArea.svelte';
	import type { Suggestion } from '../../types';

	interface Props {
		draft: JournalDraft;
		suggest: (symbol: '#' | '@', query: string) => Suggestion[];
	}

	let { draft = $bindable(), suggest }: Props = $props();
</script>

<div class="grid gap-2 sm:grid-cols-3">
	<LabeledRefArea
		label="Problème"
		bind:value={draft.problem}
		{suggest}
		placeholder="Ce qu’on a constaté"
	/>
	<LabeledRefArea
		label="Cause"
		bind:value={draft.cause}
		{suggest}
		placeholder="Pourquoi ça arrivait"
	/>
	<LabeledRefArea
		label="Solution"
		bind:value={draft.solution}
		{suggest}
		placeholder="Ce qui a été changé"
	/>
</div>
