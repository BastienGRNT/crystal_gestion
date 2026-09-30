<script lang="ts">
	import { CornerDownRight } from '@lucide/svelte';

	interface Props {
		ref: string;
		author: string;
		excerpt: string;
		onjump: (ref: string) => void;
	}

	let { ref, author, excerpt, onjump }: Props = $props();
</script>

<button
	type="button"
	onclick={() => onjump(ref)}
	class="mb-1 flex max-w-full items-center gap-1.5 rounded-md border-l-2 border-line-strong bg-sunken/60 py-1 pr-2.5 pl-2 text-left text-sm text-ink-3 transition hover:border-accent hover:text-ink-2"
>
	<CornerDownRight size={12} class="shrink-0" />
	<span class="shrink-0 font-medium text-ink-2">{author}</span>
	<span class="truncate">{excerpt}</span>
</button>
