<script lang="ts">
	import type { JournalEntryView } from '$lib/client/views/journal-entry';
	import FeatureTag from '../../molecules/FeatureTag.svelte';
	import type { RefView } from '../../types';
	import EntryByline from './EntryByline.svelte';
	import JournalEntryBody from './JournalEntryBody.svelte';
	import JournalItem from './JournalItem.svelte';
	import JournalKindBadge from './JournalKindBadge.svelte';

	interface Props {
		entry: JournalEntryView;
		resolve: (ref: string) => RefView | undefined;
		personName: (userId: string) => string | undefined;
		onopen: () => void;
	}

	let { entry, resolve, personName, onopen }: Props = $props();
</script>

<JournalItem
	kind={entry.kind}
	draft={entry.draft}
	{onopen}
	markerTop="top-[1.3rem]"
	class="rounded-lg border border-line bg-surface px-4 py-3.5 hover:border-line-strong hover:shadow-pop sm:px-5"
>
	<div class="flex items-center gap-2">
		<JournalKindBadge kind={entry.kind} />
		<span class="font-mono text-[11.5px] text-ink-3">{entry.ref}</span>
		{#if entry.feature}<FeatureTag feature={entry.feature} />{/if}
		<EntryByline author={entry.author} at={entry.createdAt} />
	</div>
	<h3 class="mt-1.5 font-display text-[23px] leading-[1.15] text-ink">{entry.title}</h3>
	<div class="mt-2"><JournalEntryBody body={entry.body} {resolve} {personName} /></div>
</JournalItem>
