<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { dayHeading } from '$lib/client/views/day-heading';
	import type { ElementSources } from '$lib/client/views/element-sources.svelte';
	import type { DayGroup } from '$lib/client/views/journal-timeline';
	import type { JournalEntry } from '$lib/modules/journal/domain/journal-entry';
	import JournalDay from '$lib/ui/organisms/journal/JournalDay.svelte';
	import JournalEntryCard from '$lib/ui/organisms/journal/JournalEntryCard.svelte';
	import JournalScopeRow from '$lib/ui/organisms/journal/JournalScopeRow.svelte';

	let { groups, sources }: { groups: DayGroup<JournalEntry>[]; sources: ElementSources } = $props();
	const { refs, peek } = useProject();
	const today = new Date();
</script>

{#each groups as group (group.day)}
	<JournalDay {...dayHeading(group.day, today)}>
		{#each group.items as item (item.id)}
			{@const entry = sources.journal(item)}
			{#if entry.body.kind === 'scope' && entry.body.change}
				<JournalScopeRow
					{entry}
					change={entry.body.change}
					featureTitle={entry.body.featureTitle}
					onopen={() => peek(entry.ref)}
				/>
			{:else}
				<JournalEntryCard
					{entry}
					resolve={refs.resolve}
					personName={refs.personName}
					onopen={() => peek(entry.ref)}
				/>
			{/if}
		{/each}
	</JournalDay>
{/each}
