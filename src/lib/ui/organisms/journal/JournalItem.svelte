<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { JournalKind } from '$lib/modules/journal/domain/journal-entry';
	import { KIND_STYLE } from './kind-style';

	interface Props {
		kind: JournalKind;
		draft: boolean;
		onopen: () => void;
		/** Vertical offset of the marker, aligned on the first line of the item. */
		markerTop: string;
		class: string;
		children: Snippet;
	}

	let { kind, draft, onopen, markerTop, class: extra, children }: Props = $props();
	const open = (event: Event) => !(event.target as HTMLElement).closest('a') && onopen();
</script>

<li class="relative animate-rise {draft ? 'opacity-60' : ''}">
	<span
		class="absolute -left-[calc(1.25rem+5px)] size-2.5 rounded-full ring-4 ring-bg sm:-left-[calc(2rem+5px)] {markerTop} {KIND_STYLE[
			kind
		].dot}"
	></span>
	<div
		role="button"
		tabindex="0"
		onclick={open}
		onkeydown={(event) => event.key === 'Enter' && open(event)}
		class="transition {extra}"
	>
		{@render children()}
	</div>
</li>
