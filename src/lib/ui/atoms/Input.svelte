<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends HTMLInputAttributes {
		value?: string;
		element?: HTMLInputElement;
	}

	let { value = $bindable(''), element = $bindable(), class: extra, ...rest }: Props = $props();
</script>

<input
	bind:this={element}
	bind:value
	class="h-9 w-full rounded-md border border-line bg-surface px-3 text-ink transition outline-none placeholder:text-ink-3 hover:border-line-strong focus:border-accent focus:ring-3 focus:ring-accent/15 {extra}"
	{...rest}
/>
