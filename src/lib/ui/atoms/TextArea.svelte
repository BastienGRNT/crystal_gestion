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
		rows = 1,
		class: extra = '',
		...rest
	}: Props = $props();

	/**
	 * Fits the box to its text. A hidden field (in a closed dialog) measures 0: it is measured
	 * again once it shows, and the borders count, so the last line never hides behind a scrollbar.
	 */
	function fit() {
		if (!element || !element.clientWidth) return;
		element.style.height = 'auto';
		const full = element.scrollHeight + element.offsetHeight - element.clientHeight;
		element.style.height = `${Math.min(full, maxHeight)}px`;
		element.style.overflowY = full > maxHeight ? 'auto' : 'hidden';
	}

	$effect(() => {
		void value;
		fit();
	});

	$effect(() => {
		if (!element) return;
		let width = 0;
		const observer = new ResizeObserver(([entry]) => {
			if (entry.contentRect.width === width) return;
			width = entry.contentRect.width;
			fit();
		});
		observer.observe(element);
		return () => observer.disconnect();
	});
</script>

<textarea
	bind:this={element}
	bind:value
	{rows}
	class={[
		'w-full resize-none text-base text-ink outline-none placeholder:text-ink-4',
		bare
			? 'bg-transparent'
			: 'min-h-11 rounded-xl border border-line-strong/70 bg-surface px-3.5 py-2.5 leading-relaxed shadow-card hover:border-line-strong focus:border-accent focus:ring-4 focus:ring-accent-soft',
		extra
	]}
	{...rest}></textarea>
