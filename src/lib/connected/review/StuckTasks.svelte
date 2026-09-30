<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { TaskSources } from '$lib/client/views/task-sources.svelte';
	import { isLate, isStale } from '$lib/modules/tasks/domain/health';
	import TaskRow from '$lib/ui/molecules/TaskRow.svelte';

	let { count = $bindable(0) }: { count?: number } = $props();
	const { store, actions, peek } = useProject();
	const sources = new TaskSources(store);
	const now = new Date();
	const stuck = $derived(
		store.tasks.items
			.map((task) => ({ task, reason: isLate(task, now) ? 'En retard' : isStale(task, now) ? 'Au point mort depuis 7 jours' : null }))
			.filter((item) => item.reason !== null)
	);
	$effect(() => {
		count = stuck.length;
	});
</script>

{#each stuck as { task, reason } (task.id)}
	<div class="flex items-center gap-2">
		<span class="w-44 shrink-0 text-[11.5px] font-medium {reason === 'En retard' ? 'text-danger' : 'text-warning'} max-sm:hidden">{reason}</span>
		<div class="min-w-0 flex-1">
			<TaskRow task={sources.card(task)} ontoggle={(done) => done && actions.tasks.finish(task.id)} onopen={() => peek(task.ref)} />
		</div>
	</div>
{:else}
	<p class="text-[13px] text-ink-3">Rien de bloqué ni en retard. 👏</p>
{/each}
