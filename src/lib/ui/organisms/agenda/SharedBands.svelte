<script lang="ts">
	import { minutesToPx } from '$lib/modules/planning/domain/grid';
	import { topOf } from './geometry';
	import type { GridFrame, SharedBand } from './types';

	let { bands, frame }: { bands: SharedBand[]; frame: GridFrame } = $props();
</script>

{#each bands as band (band.start)}
	<div
		class="pointer-events-none absolute inset-x-0 border-y border-accent/30 bg-accent/8"
		style="top:{topOf(band.start, frame)}px;height:{minutesToPx(band.end - band.start, frame)}px"
		title="Ensemble : {band.names.join(', ')}"
	>
		<span class="absolute top-0 left-0 h-full w-[3px] bg-accent"></span>
	</div>
{/each}
