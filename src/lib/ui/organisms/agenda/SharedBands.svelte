<script lang="ts">
	import { minutesToPx } from '$lib/modules/planning/domain/grid';
	import type { SharedBand } from './types';

	let { bands, hourHeight }: { bands: SharedBand[]; hourHeight: number } = $props();
</script>

{#each bands as band (band.start)}
	<div
		class="pointer-events-none absolute inset-x-0 border-y border-accent/30 bg-accent/8"
		style="top:{minutesToPx(band.start, { hourHeight })}px;height:{minutesToPx(
			band.end - band.start,
			{ hourHeight }
		)}px"
		title="Ensemble : {band.names.join(', ')}"
	>
		<span class="absolute top-0 left-0 h-full w-[3px] bg-accent"></span>
	</div>
{/each}
