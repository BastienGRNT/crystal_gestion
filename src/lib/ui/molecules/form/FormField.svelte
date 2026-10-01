<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/** A question, in plain words: « Qui s’en occupe ? ». */
		label: string;
		optional?: boolean;
		hint?: string;
		children: Snippet;
	}

	let { label, optional = false, hint, children }: Props = $props();
</script>

<div>
	<p class="mb-2 text-ui font-bold text-ink-2">
		{label}{#if optional}<span class="font-medium text-ink-3"> (facultatif)</span>{/if}
	</p>
	{@render children()}
	{#if hint}<p class="mt-2 text-xs text-ink-3">{hint}</p>{/if}
</div>
