<script lang="ts">
	import type { Moscow } from '$lib/modules/features/domain/feature';
	import Avatar from '../../atoms/Avatar.svelte';
	import ProgressBar from '../../atoms/ProgressBar.svelte';
	import PriorityMenu from '../../molecules/PriorityMenu.svelte';
	import type { FeatureRowView } from '../../types';

	let { feature, onpriority }: { feature: FeatureRowView; onpriority: (priority: Moscow) => void } = $props();
</script>

<div class="group flex min-h-12 animate-rise items-center gap-3 border-b border-line px-1 last:border-0">
	<PriorityMenu priority={feature.priority} onchange={onpriority} />
	<a href={feature.href} class="flex min-w-0 flex-1 items-baseline gap-2.5 py-3">
		<span class="font-mono text-[11.5px] text-ink-3">{feature.ref}</span>
		<span class="truncate font-medium group-hover:text-accent">{feature.title}</span>
	</a>
	{#if feature.owner}<Avatar name={feature.owner.name} color={feature.owner.color} size={22} />{/if}
	<span class="hidden w-28 sm:block"><ProgressBar ratio={feature.total ? feature.done / feature.total : 0} label="Avancement de {feature.title}" /></span>
	<span class="w-10 text-right font-mono text-[11.5px] text-ink-3">{feature.total ? `${feature.done}/${feature.total}` : '—'}</span>
</div>
