<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { TaskSources } from '$lib/client/views/task-sources.svelte';
	import { isLate, isStale } from '$lib/modules/tasks/domain/health';
	import TaskItem from '../tasks/TaskItem.svelte';

	interface Props {
		/** Only my tasks (daily review). */
		mine?: boolean;
		count?: number;
	}

	// eslint-disable-next-line no-useless-assignment -- bindable prop, read by the parent page
	let { mine = false, count = $bindable(0) }: Props = $props();
	const { store, me } = useProject();
	const sources = new TaskSources(store);
	const now = new Date();
	const stuck = $derived(
		store.tasks.items
			.filter((task) => !mine || task.assigneeIds.includes(me.id))
			.map((task) => ({
				task,
				reason: isLate(task, now) ? 'En retard' : isStale(task, now) ? 'Pas bougé depuis 7 j' : null
			}))
			.filter((item) => item.reason !== null)
	);
	$effect(() => {
		count = stuck.length;
	});
</script>

<div class="-mx-2">
	{#each stuck as { task, reason } (task.id)}
		<TaskItem task={sources.card(task)}>
			{#snippet extra()}
				<span class="text-xs font-medium {reason === 'En retard' ? 'text-must' : 'text-should'}"
					>{reason}</span
				>
			{/snippet}
		</TaskItem>
	{:else}
		<p class="px-2 text-ui text-ink-3">Rien de bloqué ni en retard.</p>
	{/each}
</div>
