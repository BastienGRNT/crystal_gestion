<script lang="ts">
	import { Search } from '@lucide/svelte';
	import Kbd from '../atoms/Kbd.svelte';
	import type { PaletteGroup, PaletteItem } from '../types';

	interface Props {
		query: string;
		groups: PaletteGroup[];
		onclose: () => void;
	}

	let { query = $bindable(), groups, onclose }: Props = $props();
	let highlighted = $state(0);
	const flat = $derived(groups.flatMap((group) => group.items));

	$effect(() => {
		void query;
		highlighted = 0;
	});

	function run(item: PaletteItem | undefined) {
		if (!item) return;
		onclose();
		item.run();
	}

	function onkeydown(event: KeyboardEvent) {
		const keys: Record<string, () => void> = {
			ArrowDown: () => (highlighted = (highlighted + 1) % Math.max(flat.length, 1)),
			ArrowUp: () => (highlighted = (highlighted - 1 + flat.length) % Math.max(flat.length, 1)),
			Enter: () => run(flat[highlighted]),
			Escape: onclose
		};
		if (!keys[event.key]) return;
		event.preventDefault();
		keys[event.key]();
	}
</script>

<div
	class="fixed inset-0 z-50 flex items-start justify-center bg-ink/25 px-4 pt-[12vh] backdrop-blur-[2px]"
	role="presentation"
	onclick={onclose}
>
	<div
		class="w-full max-w-xl animate-rise overflow-hidden rounded-xl border border-line bg-surface shadow-pop"
		role="dialog"
		aria-label="Palette de commandes"
		tabindex="-1"
		onclick={(e) => e.stopPropagation()}
		onkeydown={() => {}}
	>
		<div class="flex items-center gap-3 border-b border-line px-4">
			<Search size={16} class="text-ink-3" />
			<!-- svelte-ignore a11y_autofocus -->
			<input
				bind:value={query}
				{onkeydown}
				autofocus
				placeholder="Chercher un élément, une page, une action…"
				class="h-13 flex-1 bg-transparent text-[15px] outline-none placeholder:text-ink-3"
			/>
			<Kbd>Esc</Kbd>
		</div>
		<div class="max-h-[55vh] overflow-y-auto p-1.5">
			{#each groups.filter((group) => group.items.length) as group (group.label)}
				<p class="px-2.5 pt-2 pb-1 text-[11px] font-medium tracking-wide text-ink-3 uppercase">
					{group.label}
				</p>
				{#each group.items as item (item.id)}
					{@const index = flat.indexOf(item)}
					<button
						class="flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-[13.5px] {index ===
						highlighted
							? 'bg-sunken text-ink'
							: 'text-ink-2'}"
						onmousemove={() => (highlighted = index)}
						onclick={() => run(item)}
					>
						{#if item.icon}<item.icon size={15} />{/if}
						<span class="flex-1 truncate">{item.label}</span>
						{#if item.hint}<span class="font-mono text-[11px] text-ink-3">{item.hint}</span>{/if}
					</button>
				{/each}
			{:else}
				<p class="px-3 py-6 text-center text-ink-3">
					Rien ne correspond. Essaie un titre ou une référence comme T-12.
				</p>
			{/each}
		</div>
	</div>
</div>
