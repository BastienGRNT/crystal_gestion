<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		value: string;
		options: { value: string; label: string }[];
		onchange: (value: string) => void;
		label: string;
		children: Snippet;
	}

	let { value, options, onchange, label, children }: Props = $props();
</script>

<label
	class="relative inline-flex size-6 shrink-0 items-center justify-center rounded-md text-ink-3 transition focus-within:ring-2 focus-within:ring-accent/30 hover:bg-sunken hover:text-ink"
	title={label}
>
	{@render children()}
	<select
		aria-label={label}
		{value}
		onchange={(event) => onchange(event.currentTarget.value)}
		class="absolute inset-0 cursor-pointer opacity-0"
	>
		{#each options as option (option.value)}<option value={option.value}>{option.label}</option
			>{/each}
	</select>
</label>
