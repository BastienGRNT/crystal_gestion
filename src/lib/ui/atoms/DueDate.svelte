<script lang="ts">
	import { CalendarClock } from '@lucide/svelte';
	import { dueLabel } from '$lib/client/format';
	import { dueState } from '$lib/modules/tasks/domain/deadline';

	let { date, today, done = false }: { date: string; today: string; done?: boolean } = $props();
	const state = $derived(done ? 'later' : dueState(date, today));
</script>

<span
	class={[
		'inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap',
		state === 'overdue'
			? 'text-danger-text'
			: state === 'today' || state === 'soon'
				? 'text-warn-text'
				: 'text-ink-3'
	]}
	title="Échéance"
>
	<CalendarClock size={13} aria-hidden="true" />{dueLabel(date, today)}
</span>
