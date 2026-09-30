<script lang="ts">
	import type { JournalEntryView } from '$lib/client/views/journal-entry';
	import type { ScopeChange } from '$lib/modules/features/domain/scope';
	import FeatureTag from '../../molecules/FeatureTag.svelte';
	import ScopeShift from '../../molecules/ScopeShift.svelte';
	import EntryByline from './EntryByline.svelte';
	import JournalItem from './JournalItem.svelte';
	import JournalKindBadge from './JournalKindBadge.svelte';

	interface Props {
		entry: JournalEntryView;
		change: ScopeChange;
		featureTitle: string;
		onopen: () => void;
	}

	let { entry, change, featureTitle, onopen }: Props = $props();
</script>

<!-- Automatic scope changes are events, not writing: a slim line keeps the human entries in focus. -->
<JournalItem
	kind="scope"
	draft={entry.draft}
	{onopen}
	markerTop="top-[0.95rem]"
	class="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 rounded-lg border border-dashed border-line px-4 py-2.5 hover:border-line-strong hover:bg-surface sm:px-5"
>
	<JournalKindBadge kind="scope" />
	<span class="font-mono text-xs text-ink-3">{entry.ref}</span>
	{#if entry.feature}<FeatureTag feature={entry.feature} />{:else}<span class="text-sm font-medium"
			>{featureTitle}</span
		>{/if}
	<ScopeShift {change} />
	<EntryByline author={entry.author} at={entry.createdAt} />
</JournalItem>
