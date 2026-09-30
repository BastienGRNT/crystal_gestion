<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { formatMinutes, totalMinutes } from '$lib/modules/time/domain/time-entry';

	let { taskId }: { taskId: string } = $props();
	const { store, actions } = useProject();
	const minutes = $derived(
		totalMinutes(
			store.timeEntries.items.filter((entry) => entry.taskId === taskId),
			new Date()
		)
	);
	const quick = [15, 30, 60];
</script>

<div class="flex flex-wrap items-center gap-2">
	<span class="font-mono text-sm">{minutes ? formatMinutes(minutes) : '—'}</span>
	{#each quick as amount (amount)}
		<button
			class="h-6 rounded-md border border-line px-1.5 font-mono text-2xs text-ink-3 transition hover:border-accent hover:text-accent"
			onclick={() => actions.planning.logTime(taskId, amount)}
		>
			+{amount < 60 ? `${amount} min` : '1 h'}
		</button>
	{/each}
</div>
