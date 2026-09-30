<script lang="ts">
	import { MOSCOW, MOSCOW_HINTS, MOSCOW_LABELS, type Moscow } from '$lib/modules/features/domain/feature';
	import PriorityBadge from '../atoms/PriorityBadge.svelte';
	import PriorityDot from '../atoms/PriorityDot.svelte';
	import MenuItem from './MenuItem.svelte';
	import Popover from './Popover.svelte';

	let { priority, onchange }: { priority: Moscow; onchange: (priority: Moscow) => void } = $props();
	let open = $state(false);
</script>

<Popover {open} onclose={() => (open = false)} width="w-56">
	{#snippet trigger()}
		<button type="button" onclick={() => (open = !open)} aria-label="Changer la priorité" class="rounded-sm transition hover:brightness-95">
			<PriorityBadge {priority} />
		</button>
	{/snippet}
	{#each MOSCOW as option (option)}
		<MenuItem active={option === priority} onclick={() => ((open = false), onchange(option))}>
			<PriorityDot priority={option} />
			<span class="w-14 font-medium">{MOSCOW_LABELS[option]}</span>
			<span class="text-[12px] text-ink-3">{MOSCOW_HINTS[option]}</span>
		</MenuItem>
	{/each}
</Popover>
