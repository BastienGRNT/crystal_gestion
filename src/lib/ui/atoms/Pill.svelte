<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		selected: boolean;
		onclick: () => void;
		children: Snippet;
		title?: string;
		/** Room on the left for an avatar. */
		avatar?: boolean;
	}

	let { selected, onclick, children, title, avatar = false }: Props = $props();
</script>

<!-- A one-click choice: what is picked is visible without opening anything. -->
<button
	type="button"
	aria-pressed={selected}
	{onclick}
	{title}
	class="inline-flex h-7 items-center gap-1.5 rounded-full border text-xs font-medium whitespace-nowrap transition {avatar
		? 'pr-2.5 pl-1'
		: 'px-2.5'} {selected
		? 'border-accent bg-accent-soft text-accent-text'
		: 'border-line text-ink-2 hover:bg-hover hover:text-ink'}"
>
	{@render children()}
</button>
