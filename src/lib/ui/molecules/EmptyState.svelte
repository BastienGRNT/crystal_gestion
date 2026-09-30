<script lang="ts">
	import type { Component, Snippet } from 'svelte';

	interface Props {
		icon: Component<{ size?: number; strokeWidth?: number }>;
		title: string;
		text?: string;
		children?: Snippet;
	}

	let { icon: Icon, title, text, children }: Props = $props();
</script>

<div
	class="flex flex-col items-center rounded-xl border border-dashed border-line px-6 py-10 text-center"
>
	<span class="mb-3 flex size-10 items-center justify-center rounded-full bg-sunken text-ink-3"
		><Icon size={18} strokeWidth={1.7} /></span
	>
	<p class="font-medium">{title}</p>
	{#if text}<p class="mt-1 max-w-xs text-[13px] text-ink-3">{text}</p>{/if}
	{#if children}<div class="mt-4">{@render children()}</div>{/if}
</div>
