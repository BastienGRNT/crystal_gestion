<script lang="ts">
	import { KIND_META } from '$lib/client/refs/kinds';
	import { JOURNAL_LABELS, type JournalKind } from '$lib/modules/journal/domain/journal-entry';
	import { KIND_STYLE } from './kind-style';

	let { kind }: { kind: JournalKind } = $props();
	const Icon = $derived(KIND_META[kind].icon);
</script>

<span
	class="inline-flex h-5 items-center gap-1 rounded-sm px-1.5 text-[11.5px] font-medium {KIND_STYLE[
		kind
	].badge}"
>
	<Icon size={12} strokeWidth={2.2} />{JOURNAL_LABELS[kind]}
</span>
