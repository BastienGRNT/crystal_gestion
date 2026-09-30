<script lang="ts">
	interface Props {
		tag: string;
		active?: boolean;
		onclick?: () => void;
	}

	let { tag, active = false, onclick }: Props = $props();
	const classes = $derived(
		`inline-flex h-5 items-center rounded-[4px] px-1.5 font-mono text-[11px] transition ${
			active ? 'bg-accent text-accent-ink' : 'bg-sunken text-ink-2 hover:text-accent'
		}`
	);
</script>

{#if onclick}
	<button type="button" {onclick} class={classes} title="Filtrer par {tag}">#{tag}</button>
{:else}
	<span class={classes}>#{tag}</span>
{/if}
