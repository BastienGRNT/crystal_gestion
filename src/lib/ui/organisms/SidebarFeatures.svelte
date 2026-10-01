<script lang="ts">
	import { Plus } from '@lucide/svelte';
	import ProgressRing from '../atoms/ProgressRing.svelte';
	import type { SidebarFeature } from '../types';

	let { features, oncreate }: { features: SidebarFeature[]; oncreate: () => void } = $props();
</script>

<!-- Features are where work lives: always one click away, like channels in a chat app. -->
<section class="mt-5 flex min-h-0 flex-col" aria-label="Features">
	<div class="flex h-7 items-center justify-between pr-1 pl-2.5">
		<span class="text-xs font-medium text-ink-3">Features</span>
		<button
			type="button"
			onclick={oncreate}
			title="Nouvelle feature (F)"
			aria-label="Nouvelle feature"
			class="flex size-6 items-center justify-center rounded-md text-ink-3 transition hover:bg-side-hover hover:text-ink"
			><Plus size={14} /></button
		>
	</div>
	<div class="flex min-h-0 flex-col gap-px overflow-y-auto">
		{#each features as feature (feature.id)}
			<a
				href={feature.href}
				aria-current={feature.active ? 'page' : undefined}
				class="flex h-8 shrink-0 items-center gap-2.5 rounded-lg px-2.5 text-ui transition {feature.active
					? 'bg-panel font-medium text-ink shadow-[0_1px_2px_rgb(0_0_0/0.06)]'
					: 'text-ink-2 hover:bg-side-hover hover:text-ink'}"
			>
				<span class="size-2.5 shrink-0 rounded-[3px]" style="background:{feature.color}"></span>
				<span class="min-w-0 flex-1 truncate">{feature.title}</span>
				<ProgressRing ratio={feature.ratio} color={feature.color} />
			</a>
		{:else}
			<button
				type="button"
				onclick={oncreate}
				class="rounded-lg px-2.5 py-1.5 text-left text-xs text-ink-3 hover:text-ink"
				>Une feature = un morceau du produit. Crée la première.</button
			>
		{/each}
	</div>
</section>
