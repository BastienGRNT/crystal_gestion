<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import InlineText from './InlineText.svelte';

	interface Props {
		icon: Component<{ size?: number; class?: string }>;
		label: string;
		value: string;
		placeholder: string;
		onsave: (value: string) => void;
		mono?: boolean;
		trailing?: Snippet;
	}

	let { icon: Icon, label, value, placeholder, onsave, mono = false, trailing }: Props = $props();
</script>

<div class="group/line flex min-h-8 items-center gap-2.5" title={label}>
	<Icon size={14} class="shrink-0 text-ink-3" />
	<div class="min-w-0 flex-1 truncate">
		<InlineText
			{value}
			{onsave}
			{placeholder}
			required={false}
			class="truncate py-0.5 text-sm {mono ? 'font-mono text-sm' : ''}"
		/>
	</div>
	{#if trailing && value}
		<div
			class="flex shrink-0 items-center gap-0.5 transition md:opacity-0 md:group-focus-within/line:opacity-100 md:group-hover/line:opacity-100"
		>
			{@render trailing()}
		</div>
	{/if}
</div>
