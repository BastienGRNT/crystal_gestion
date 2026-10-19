<script lang="ts">
	import { topOf } from './geometry';
	import type { GridFrame } from './types';

	interface Props {
		day: number;
		days: number;
		minutes: number;
		frame: GridFrame;
	}

	let { day, days, minutes, frame }: Props = $props();
</script>

{#if minutes >= frame.from && minutes <= frame.to}
	<div
		class="pointer-events-none absolute z-20 h-0 border-t-2 border-now"
		style="top:{topOf(minutes, frame)}px;left:{(day / days) * 100}%;width:{100 / days}%"
		aria-hidden="true"
	>
		<span class="absolute -top-[5px] -left-[5px] size-2 rounded-full bg-now"></span>
	</div>
{/if}
