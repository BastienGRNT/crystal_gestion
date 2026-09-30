<script lang="ts">
	import { untrack } from 'svelte';
	import { useProject } from '$lib/client/context';
	import { toDateKey } from '$lib/modules/kernel/domain/dates';
	import { ElementSources } from '$lib/client/views/element-sources.svelte';
	import { emptyDraft, toCreateInput, type DraftKind } from '$lib/client/views/journal-draft';
	import EntryComposer from '$lib/ui/organisms/journal/EntryComposer.svelte';

	let { kind, title, onclose }: { kind: DraftKind; title: string; onclose: () => void } = $props();
	const { store, actions, refs, me } = useProject();
	const sources = new ElementSources(store);
	// The draft is seeded once: later prop changes remount the composer instead.
	let draft = $state(untrack(() => emptyDraft(kind, title, toDateKey(new Date()), me.id)));

	function save() {
		actions.journal.create(toCreateInput(draft));
		onclose();
	}
</script>

<EntryComposer
	bind:draft
	featureOptions={sources.featureOptions()}
	people={store.members.items}
	suggest={refs.suggest}
	onsubmit={save}
	oncancel={onclose}
/>
