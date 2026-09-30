<script lang="ts">
	import Avatar from '$lib/ui/atoms/Avatar.svelte';
	import type { AgendaDay, AgendaLane } from './types';

	let { days, lanes }: { days: AgendaDay[]; lanes: AgendaLane[] } = $props();
</script>

<div class="sticky top-0 z-30 flex border-b border-line bg-surface/95 backdrop-blur">
	<div class="w-11 shrink-0"></div>
	<div class="grid flex-1" style="grid-template-columns:repeat({days.length},minmax(0,1fr))">
		{#each days as day (day.key)}
			<div class="min-w-0 border-l border-line px-1.5 pt-2 pb-1.5 text-center">
				<p class="text-[11px] tracking-wide text-ink-3 uppercase">{day.weekday}</p>
				<p
					class="mx-auto mt-0.5 flex size-7 items-center justify-center rounded-full font-display text-[20px] leading-none {day.today
						? 'bg-accent text-accent-ink'
						: 'text-ink'}"
				>
					{day.date}
				</p>
				{#if lanes.length > 1}
					<div class="mt-1.5 flex justify-around">
						{#each lanes as lane (lane.id)}
							<span class="flex min-w-0 items-center gap-1.5 text-[12px] text-ink-2">
								<Avatar name={lane.name} color={lane.color} size={16} />
								{#if days.length === 1}<span class="truncate">{lane.name}</span>{/if}
							</span>
						{/each}
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>
