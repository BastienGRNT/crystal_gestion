<script lang="ts">
	import type { Suggestion } from '../types';

	interface Props {
		items: Suggestion[];
		highlighted: number;
		onpick: (item: Suggestion) => void;
	}

	let { items, highlighted, onpick }: Props = $props();
</script>

<ul
	class="absolute z-50 mt-1 max-h-64 w-full max-w-sm animate-rise overflow-y-auto rounded-lg border border-line bg-surface p-1 shadow-pop"
	role="listbox"
>
	{#each items as item, index (item.id)}
		<li role="option" aria-selected={index === highlighted}>
			<button
				type="button"
				class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] {index ===
				highlighted
					? 'bg-sunken'
					: ''}"
				onmousedown={(event) => (event.preventDefault(), onpick(item))}
			>
				{#if item.hint}<span class="w-12 shrink-0 font-mono text-[11px] text-ink-3"
						>{item.hint}</span
					>{/if}
				<span class="truncate">{item.label}</span>
			</button>
		</li>
	{:else}
		<li class="px-2 py-1.5 text-[13px] text-ink-3">Aucun résultat</li>
	{/each}
</ul>
