<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	interface Props extends HTMLTextareaAttributes {
		value?: string;
		element?: HTMLTextAreaElement;
		/** Grows with its content up to this height (px), then scrolls. */
		maxHeight?: number;
		bare?: boolean;
	}

	let {
		value = $bindable(''),
		element = $bindable(),
		maxHeight = 360,
		bare = false,
		class: extra = '',
		...rest
	}: Props = $props();

	$effect(() => {
		void value;
		if (!element) return;
		element.style.height = 'auto';
		element.style.height = `${Math.min(element.scrollHeight, maxHeight)}px`;
	});
</script>

<textarea
	bind:this={element}
	bind:value
	rows="1"
	class={[
		'w-full resize-none text-base text-ink outline-none placeholder:text-ink-4',
		bare
			? 'bg-transparent'
			: 'rounded-xl border border-line-strong/70 bg-surface px-3.5 py-2.5 leading-relaxed shadow-card hover:border-line-strong focus:border-accent focus:ring-4 focus:ring-accent-soft',
		extra
	]}
	{...rest}></textarea>
