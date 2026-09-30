<script lang="ts">
	import { clockLabel } from '$lib/modules/planning/domain/calendar';
	import { boxStyle } from './geometry';
	import type { AgendaDraft } from './types';

	let { draft, lanes, hourHeight }: { draft: AgendaDraft; lanes: number; hourHeight: number } =
		$props();
</script>

<div
	class="pointer-events-none absolute z-30 flex flex-col rounded-md border-2 border-accent px-1.5 py-1 shadow-pop {draft.layer ===
	'block'
		? 'bg-ink/85 text-bg'
		: 'bg-accent-soft/90 text-accent'}"
	style={boxStyle(draft, lanes, hourHeight)}
>
	<span class="font-mono text-2xs font-medium"
		>{clockLabel(draft.start)}–{clockLabel(draft.end % 1440)}</span
	>
</div>
