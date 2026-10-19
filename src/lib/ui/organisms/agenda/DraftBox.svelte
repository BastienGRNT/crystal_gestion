<script lang="ts">
	import { clockLabel } from '$lib/modules/planning/domain/calendar';
	import { boxStyle } from './geometry';
	import type { AgendaDraft, GridFrame } from './types';

	let { draft, lanes, frame }: { draft: AgendaDraft; lanes: number; frame: GridFrame } = $props();
</script>

<div
	class="pointer-events-none absolute z-30 flex flex-col rounded-md border-2 border-accent px-1.5 py-1 shadow-pop {draft.layer ===
	'block'
		? 'bg-ink/85 text-bg'
		: 'bg-accent-soft text-accent-text'}"
	style={boxStyle(draft, lanes, frame)}
>
	<span class="font-mono text-xs font-medium"
		>{clockLabel(draft.start)}–{clockLabel(draft.end % 1440)}</span
	>
</div>
