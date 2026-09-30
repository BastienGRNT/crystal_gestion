<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	interface Props extends HTMLTextareaAttributes {
		value?: string;
		element?: HTMLTextAreaElement;
	}

	let { value = $bindable(''), element = $bindable(), class: extra, ...rest }: Props = $props();
</script>

<textarea
	bind:this={element}
	bind:value
	class="field-sizing-content min-h-20 w-full resize-none rounded-md border border-line bg-surface px-3 py-2 text-ink transition outline-none placeholder:text-ink-3 hover:border-line-strong focus:border-accent focus:ring-3 focus:ring-accent/15 {extra}"
	{...rest}></textarea>
