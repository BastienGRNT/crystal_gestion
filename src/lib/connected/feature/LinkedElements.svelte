<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { KIND_META } from '$lib/client/refs/kinds';
	import type { ElementBase } from '$lib/modules/kernel/domain/element';

	/** Elements structurally attached to the feature (journal entries, ideas, resources, files). */
	let { items, empty }: { items: ElementBase[]; empty: string } = $props();
	const { refs } = useProject();
</script>

{#each items as item (item.id)}
	{@const Icon = KIND_META[item.kind].icon}
	<a
		href={refs.href(item)}
		class="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition hover:bg-sunken"
	>
		<Icon size={14} class="shrink-0 text-ink-3" />
		<span class="w-11 shrink-0 font-mono text-2xs text-ink-3">{item.ref}</span>
		<span class="truncate">{item.title}</span>
	</a>
{:else}
	<p class="px-2 text-sm text-ink-3">{empty}</p>
{/each}
