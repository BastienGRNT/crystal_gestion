<script lang="ts">
	import {
		MOSCOW,
		MOSCOW_HINTS,
		MOSCOW_LABELS,
		type Moscow
	} from '$lib/modules/features/domain/feature';
	import PriorityDot from '../atoms/PriorityDot.svelte';
	import MenuItem from './MenuItem.svelte';
	import Popover from './Popover.svelte';
	import { PRIORITY_COLORS, soft } from '../tones';

	let { priority, onchange }: { priority: Moscow; onchange: (priority: Moscow) => void } = $props();
	let open = $state(false);
</script>

<Popover {open} onclose={() => (open = false)} width="w-64">
	{#snippet trigger()}
		<button
			type="button"
			onclick={() => (open = !open)}
			aria-label="Changer la priorité de la feature"
			class="inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium whitespace-nowrap transition hover:brightness-95"
			style="background:{soft(PRIORITY_COLORS[priority])}"
		>
			<PriorityDot {priority} />{MOSCOW_LABELS[priority]}
		</button>
	{/snippet}
	{#each MOSCOW as option (option)}
		<MenuItem active={option === priority} onclick={() => ((open = false), onchange(option))}>
			<PriorityDot priority={option} />
			<span class="flex flex-col"
				><span class="font-medium">{MOSCOW_LABELS[option]}</span><span class="text-xs text-ink-3"
					>{MOSCOW_HINTS[option]}</span
				></span
			>
		</MenuItem>
	{/each}
</Popover>
