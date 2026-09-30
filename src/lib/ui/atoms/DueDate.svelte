<script lang="ts">
	import { CalendarClock } from '@lucide/svelte';
	import { formatDueDate } from '$lib/client/format';

	let { date, tone }: { date: string; tone: 'late' | 'soon' | null } = $props();
	const tones = { late: 'text-danger bg-danger/10', soon: 'text-warning bg-warning/12', none: 'text-ink-3' };
</script>

<span class="inline-flex h-5 items-center gap-1 rounded px-1 text-[11.5px] {tones[tone ?? 'none']}" title={tone === 'late' ? 'En retard' : 'Échéance'}>
	<CalendarClock size={12} />{formatDueDate(date)}
</span>
