<script lang="ts">
	import type { Component, Snippet } from 'svelte';

	interface Props {
		icon: Component<{ size?: number; strokeWidth?: number }>;
		title: string;
		text?: string;
		children?: Snippet;
		/** Compact version for side columns and small sections. */
		compact?: boolean;
	}

	let { icon: Icon, title, text, children, compact = false }: Props = $props();
</script>

<div
	class="flex flex-col items-center rounded-xl border border-dashed border-line-strong/70 text-center {compact
		? 'px-4 py-5'
		: 'px-6 py-10'}"
>
	<span class="mb-3 flex size-10 items-center justify-center rounded-full bg-sunken text-ink-3"
		><Icon size={18} strokeWidth={1.7} /></span
	>
	<p class="{compact ? 'text-base' : 'text-lg'} font-semibold">{title}</p>
	{#if text}<p class="mt-1 max-w-sm {compact ? 'text-sm' : 'text-base'} text-ink-2">{text}</p>{/if}
	{#if children}<div class="mt-5">{@render children()}</div>{/if}
</div>
