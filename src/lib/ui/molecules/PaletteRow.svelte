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
	class="flex min-h-[38px] w-full items-center gap-3 rounded-lg px-3 py-1.5 text-left text-sm {highlighted
		? 'bg-hover text-ink'
		: 'text-ink'}"
	onmousemove={onhover}
	onclick={onrun}
>
	{#if item.icon}<span class="text-ink-3"><item.icon size={15} /></span>{/if}
	<span class="min-w-0 flex-1">
		<span class="block truncate">{item.label}</span>
		{#if item.detail}<span class="block truncate text-xs text-ink-3">{item.detail}</span>{/if}
	</span>
	{#if item.hint}<span class="font-mono text-2xs text-ink-3">{item.hint}</span>{/if}
</button>
