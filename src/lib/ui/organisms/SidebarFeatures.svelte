<script lang="ts">
	import { Plus } from '@lucide/svelte';
	import ProgressRing from '../atoms/ProgressRing.svelte';
	import type { SidebarFeature } from '../types';

	let { features, oncreate }: { features: SidebarFeature[]; oncreate: () => void } = $props();
</script>

<!-- Feats are where work lives: always one click away, like channels in a chat app. -->
<section class="mt-7 flex min-h-0 flex-col" aria-label="Feats">
	<div class="mb-1 flex h-7 items-center justify-between pr-1 pl-3">
		<span class="text-xs font-bold tracking-[0.08em] text-side-ink-3 uppercase">Feats</span>
		<button
			type="button"
			onclick={oncreate}
			title="Nouvelle Feat (F)"
			aria-label="Nouvelle Feat"
			class="flex size-7 items-center justify-center rounded-lg text-side-ink-3 transition hover:bg-side-hover hover:text-side-ink"
			><Plus size={16} /></button
		>
	</div>
	<div class="flex min-h-0 flex-col gap-0.5 overflow-y-auto">
		{#each features as feature (feature.id)}
			<a
				href={feature.href}
				aria-current={feature.active ? 'page' : undefined}
				class="flex h-9 shrink-0 items-center gap-3 rounded-[9px] px-3 text-sm font-medium transition hover:no-underline {feature.active
					? 'bg-side-active text-white'
					: 'text-side-ink hover:bg-side-hover'}"
			>
				<span class="size-3 shrink-0 rounded-[4px]" style="background:{feature.color}"></span>
				<span class="min-w-0 flex-1 truncate">{feature.title}</span>
				<ProgressRing ratio={feature.ratio} color={feature.color} />
			</a>
		{:else}
			<button
				type="button"
				onclick={oncreate}
				class="rounded-lg px-3 py-1.5 text-left text-xs text-side-ink-2 hover:text-side-ink"
				>Une Feat = un morceau du produit. Crée la première.</button
			>
		{/each}
	</div>
</section>
