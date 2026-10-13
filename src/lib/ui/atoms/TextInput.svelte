<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends HTMLInputAttributes {
		value?: string;
		element?: HTMLInputElement;
		invalid?: boolean;
	}

	let {
		value = $bindable(''),
		element = $bindable(),
		invalid = false,
		class: extra = '',
		...rest
	}: Props = $props();
</script>

<input
	bind:this={element}
	bind:value
	class={[
		'h-11 w-full rounded-xl border bg-surface px-3.5 text-base text-ink shadow-card transition-colors outline-none placeholder:text-ink-4',
		'focus:border-accent focus:ring-4 focus:ring-accent-soft',
		invalid ? 'border-danger' : 'border-line-strong/70 hover:border-line-strong',
		extra
	]}
	{...rest}
/>
