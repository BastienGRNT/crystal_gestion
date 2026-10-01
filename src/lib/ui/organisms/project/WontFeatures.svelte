<script lang="ts">
	import Dot from '../../atoms/Dot.svelte';
	import type { FeatureRowView } from '../../types';

	let { features, onrestore }: { features: FeatureRowView[]; onrestore: (id: string) => void } =
		$props();
</script>

<div class="flex items-center gap-2 px-3 pt-7 pb-2">
	<Dot color="var(--wont)" size={8} />
	<span class="text-ui font-semibold">Pas maintenant</span>
	<span class="text-xs text-ink-3">Écartées pour cette version</span>
</div>
<div class="flex flex-wrap gap-2 px-1">
	{#each features as feature (feature.id)}
		<div
			class="relative flex h-10 items-center gap-2.5 rounded-[10px] border border-dashed border-line-strong pr-1.5 pl-3 text-ink-2 transition hover:bg-hover"
		>
			<a
				href={feature.href}
				class="flex items-center gap-2.5 after:absolute after:inset-0 after:content-['']"
				><span class="font-mono text-2xs text-ink-3">{feature.ref}</span>{feature.title}</a
			>
			<button
				type="button"
				onclick={() => onrestore(feature.id)}
				class="relative h-7 rounded-md px-2 text-xs text-accent-text transition hover:bg-accent-soft"
				>Réactiver</button
			>
		</div>
	{/each}
</div>
