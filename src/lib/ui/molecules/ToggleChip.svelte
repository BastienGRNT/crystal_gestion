<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		pressed: boolean;
		onclick: () => void;
		children: Snippet;
	}

	let { pressed, onclick, children }: Props = $props();
</script>

<button
	type="button"
	aria-pressed={pressed}
	{onclick}
	class="inline-flex h-8 items-center gap-2 rounded-full border px-3 text-[13px] transition {pressed
		? 'border-accent bg-accent-soft text-accent'
		: 'border-line bg-surface text-ink-2 hover:border-line-strong'}"
>
	{@render children()}
</button>
