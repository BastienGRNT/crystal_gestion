<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		label: string;
		hint?: string;
		/** id of the control, for the label. */
		for?: string;
		children: Snippet;
	}

	let { label, hint, for: control, children }: Props = $props();
</script>

<div class="flex flex-col gap-2">
	<label for={control} class="text-sm font-semibold text-ink-2">{label}</label>
	{@render children()}
	{#if hint}<p class="text-sm text-ink-3">{hint}</p>{/if}
</div>
