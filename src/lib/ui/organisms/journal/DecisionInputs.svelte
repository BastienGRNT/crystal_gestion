<script lang="ts">
	import type { JournalDraft } from '$lib/client/views/journal-draft';
	import type { PersonView } from '$lib/client/views/element-view';
	import DateInput from '../../atoms/DateInput.svelte';
	import AssigneePicker from '../../molecules/AssigneePicker.svelte';
	import LabeledRefArea from '../../molecules/LabeledRefArea.svelte';
	import type { Suggestion } from '../../types';

	interface Props {
		draft: JournalDraft;
		people: PersonView[];
		suggest: (symbol: '#' | '@', query: string) => Suggestion[];
	}

	let { draft = $bindable(), people, suggest }: Props = $props();
</script>

<LabeledRefArea
	label="Pourquoi"
	bind:value={draft.rationale}
	{suggest}
	placeholder="Le contexte, les options écartées, ce qui a fait pencher la balance…"
/>
<div class="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-ink-3">
	<span class="flex items-center gap-1">
		Décidé par
		<AssigneePicker
			{people}
			selected={draft.decidedBy}
			emptyLabel="Choisir"
			onchange={(ids) => (draft.decidedBy = ids)}
		/>
	</span>
	<span class="flex items-center gap-1">
		le
		<DateInput
			label="Date de la décision"
			value={draft.decidedOn}
			onchange={(day) => (draft.decidedOn = day)}
		/>
	</span>
</div>
