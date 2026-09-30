<script lang="ts">
	import type { PaletteItem } from '../types';

	interface Props {
		item: PaletteItem;
		highlighted: boolean;
		onhover: () => void;
		onrun: () => void;
	}

	let { item, highlighted, onhover, onrun }: Props = $props();
</script>

<button
	class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left {highlighted
		? 'bg-sunken text-ink'
		: 'text-ink-2'}"
	onmousemove={onhover}
	onclick={onrun}
>
	{#if item.icon}<item.icon size={16} />{/if}
	<span class="min-w-0 flex-1">
		<span class="block truncate">{item.label}</span>
		{#if item.detail}<span class="block truncate text-xs text-ink-3">{item.detail}</span>{/if}
	</span>
	{#if item.hint}<span class="font-mono text-2xs text-ink-3">{item.hint}</span>{/if}
</button>
