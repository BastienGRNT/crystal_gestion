<script lang="ts">
	import { AtSign } from '@lucide/svelte';
	import { KIND_META } from '$lib/client/refs/kinds';
	import type { RefView } from '../types';

	let { items, heading = true }: { items: RefView[]; heading?: boolean } = $props();
</script>

<section>
	{#if heading}
		<h3
			class="mb-2 flex items-center gap-1.5 text-xs font-medium tracking-wide text-ink-3 uppercase"
		>
			<AtSign size={12} /> Cité dans
		</h3>
	{/if}
	{#each items as item (item.ref)}
		{@const Icon = KIND_META[item.kind].icon}
		<a
			href={item.href}
			class="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition hover:bg-sunken"
		>
			<Icon size={14} class="shrink-0 text-ink-3" />
			<span class="w-11 shrink-0 font-mono text-2xs text-ink-3">{item.ref}</span>
			<span class="truncate">{item.title}</span>
		</a>
	{:else}
		<p class="text-sm text-ink-3">
			Rien ne pointe ici pour l’instant. Tape <span class="font-mono">#</span> dans n’importe quel texte
			pour créer un lien.
		</p>
	{/each}
</section>
