<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		onclick?: () => void;
		href?: string;
		active?: boolean;
		tone?: 'default' | 'danger';
		type?: 'button' | 'submit';
		children: Snippet;
	}

	let {
		onclick,
		href,
		active = false,
		tone = 'default',
		type = 'button',
		children
	}: Props = $props();
	const classes = $derived(
		`flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-sm transition hover:bg-sunken ${
			tone === 'danger' ? 'text-danger' : active ? 'text-ink font-medium' : 'text-ink-2'
		}`
	);
</script>

{#if href}
	<a {href} class={classes} onclick={() => onclick?.()}>{@render children()}</a>
{:else}
	<button {type} class={classes} {onclick}>{@render children()}</button>
{/if}
