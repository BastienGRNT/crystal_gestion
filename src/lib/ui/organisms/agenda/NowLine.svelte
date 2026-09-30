<script lang="ts">
	import { minutesToPx } from '$lib/modules/planning/domain/grid';

	interface Props {
		day: number;
		days: number;
		minutes: number;
		hourHeight: number;
	}

	let { day, days, minutes, hourHeight }: Props = $props();
</script>

<div
	class="pointer-events-none absolute z-20 h-0 border-t-2 border-must"
	style="top:{minutesToPx(minutes, { hourHeight })}px;left:{(day / days) * 100}%;width:{100 /
		days}%"
	aria-hidden="true"
>
	<span class="absolute -top-[5px] -left-[5px] size-2 rounded-full bg-must"></span>
</div>
