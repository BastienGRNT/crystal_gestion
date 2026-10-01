<script lang="ts">
	import { Search } from '@lucide/svelte';
	import PaletteRow from '../molecules/PaletteRow.svelte';
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
	class="fixed inset-0 z-50 flex items-start justify-center bg-overlay px-4 pt-[12vh]"
	role="presentation"
	onclick={onclose}
>
	<div
		class="w-full max-w-[620px] animate-rise overflow-hidden rounded-[14px] border border-line bg-panel shadow-pop"
		role="dialog"
		aria-label="Palette de commandes"
		tabindex="-1"
		onclick={(e) => e.stopPropagation()}
		onkeydown={() => {}}
	>
		<div class="flex items-center gap-3 border-b border-line px-[18px]">
			<Search size={18} class="text-ink-3" />
			<!-- svelte-ignore a11y_autofocus -->
			<input
				bind:value={query}
				{onkeydown}
				autofocus
				placeholder="Chercher une tâche, un mot de passe, une page… ou créer"
				class="h-[54px] flex-1 bg-transparent text-lg outline-none placeholder:text-ink-3"
			/>
		</div>
		<div class="max-h-[420px] overflow-y-auto p-1.5">
			{#each groups.filter((group) => group.items.length) as group (group.label)}
				<p class="px-3 pt-2 pb-1 text-2xs font-semibold text-ink-3">
					{group.label}
				</p>
				{#each group.items as item (item.id)}
					{@const index = flat.indexOf(item)}
					<PaletteRow
						{item}
						highlighted={index === highlighted}
						onhover={() => (highlighted = index)}
						onrun={() => run(item)}
					/>
				{/each}
			{:else}
				<p class="px-3 py-6 text-center text-ink-3">
					Rien ne correspond. Essaie un titre, une référence comme T-12, ou un mot comme « dispo ».
				</p>
			{/each}
		</div>
		<div class="flex gap-3.5 border-t border-line px-4 py-2 text-2xs text-ink-3">
			<span>↑↓ naviguer</span><span>↵ ouvrir</span><span>Échap fermer</span>
		</div>
	</div>
</div>
