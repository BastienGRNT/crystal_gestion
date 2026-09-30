<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { decisionOf, fixOf } from '$lib/modules/journal/domain/details';
	import type { JournalEntry } from '$lib/modules/journal/domain/journal-entry';
	import DetailSection from '$lib/ui/molecules/DetailSection.svelte';
	import InlineRichText from '$lib/ui/molecules/InlineRichText.svelte';

	let { entry }: { entry: JournalEntry } = $props();
	const { actions, refs } = useProject();
	type Field = { key: 'rationale' | 'problem' | 'cause' | 'solution'; label: string; hint: string };
	const FIELDS: Record<'decision' | 'fix', Field[]> = {
		decision: [{ key: 'rationale', label: 'Pourquoi', hint: 'Le contexte, les options écartées…' }],
		fix: [
			{ key: 'problem', label: 'Problème', hint: 'Ce qu’on a constaté…' },
			{ key: 'cause', label: 'Cause', hint: 'Pourquoi ça arrivait…' },
			{ key: 'solution', label: 'Solution', hint: 'Ce qui a été changé…' }
		]
	};
	// Details are replaced as a whole by the server: always send every field of the kind.
	const current = $derived(entry.kind === 'fix' ? fixOf(entry.details) : decisionOf(entry.details));
	const texts: Partial<Record<Field['key'], string>> = $derived(current);
	const save = (key: Field['key'], value: string) =>
		actions.journal.update(entry.id, { details: { ...current, [key]: value } });
</script>

{#if entry.kind !== 'scope'}
	{#each FIELDS[entry.kind] as field (field.key)}
		<DetailSection label={field.label}>
			<InlineRichText
				value={texts[field.key] ?? ''}
				resolve={refs.resolve}
				suggest={refs.suggest}
				placeholder={field.hint}
				onsave={(value) => save(field.key, value)}
			/>
		</DetailSection>
	{/each}
{/if}
