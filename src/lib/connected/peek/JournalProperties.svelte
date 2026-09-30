<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { formatDay, formatTime } from '$lib/client/format';
	import { ElementSources } from '$lib/client/views/element-sources.svelte';
	import { decisionOf, isScopeDetails } from '$lib/modules/journal/domain/details';
	import type { JournalEntry } from '$lib/modules/journal/domain/journal-entry';
	import Avatar from '$lib/ui/atoms/Avatar.svelte';
	import DateInput from '$lib/ui/atoms/DateInput.svelte';
	import Select from '$lib/ui/atoms/Select.svelte';
	import AssigneePicker from '$lib/ui/molecules/AssigneePicker.svelte';
	import PropertyRow from '$lib/ui/molecules/PropertyRow.svelte';
	import ScopeShift from '$lib/ui/molecules/ScopeShift.svelte';

	let { entry }: { entry: JournalEntry } = $props();
	const { store, actions } = useProject();
	const sources = new ElementSources(store);
	const decision = $derived(decisionOf(entry.details));
	const author = $derived(store.members.get(entry.createdBy ?? ''));
	const saveDecision = (changes: Partial<typeof decision>) =>
		actions.journal.update(entry.id, { details: { ...decision, ...changes } });
</script>

<div class="flex flex-col gap-1">
	<PropertyRow label="Feature">
		<Select
			label="Feature"
			value={entry.featureId ?? ''}
			options={sources.featureOptions()}
			class="w-full"
			onchange={(id) => actions.journal.update(entry.id, { featureId: id || null })}
		/>
	</PropertyRow>
	{#if entry.kind === 'decision'}
		<PropertyRow label="Décidé par">
			<AssigneePicker
				people={store.members.items}
				selected={decision.decidedBy}
				emptyLabel="Choisir"
				onchange={(decidedBy) => saveDecision({ decidedBy })}
			/>
		</PropertyRow>
		<PropertyRow label="Décidé le">
			<DateInput
				label="Date de la décision"
				value={decision.decidedOn}
				onchange={(decidedOn) => saveDecision({ decidedOn })}
			/>
		</PropertyRow>
	{/if}
	{#if isScopeDetails(entry.details)}
		<PropertyRow label="Changement"><ScopeShift change={entry.details} /></PropertyRow>
	{/if}
	<PropertyRow label="Consigné">
		<span class="flex items-center gap-1.5 px-2 text-[13px] text-ink-2">
			{#if author}<Avatar name={author.name} color={author.color} size={18} />{author.name} ·{/if}
			{formatDay(entry.createdAt, { day: 'numeric', month: 'long' })} à {formatTime(
				entry.createdAt
			)}
		</span>
	</PropertyRow>
</div>
