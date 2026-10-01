<script lang="ts">
	import { Play } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import { lastWorkedTaskId } from '$lib/client/views/catch-up';
	import { TaskSources } from '$lib/client/views/task-sources.svelte';
	import Card from '$lib/ui/molecules/Card.svelte';
	import TaskItem from '../tasks/TaskItem.svelte';

	/** Where I left off: the task I last timed, what I have in progress, what waits for my review. */
	const { store, actions, me, peek } = useProject();
	const sources = new TaskSources(store);
	const last = $derived(store.tasks.get(lastWorkedTaskId(store.timeEntries.items, me.id) ?? ''));
	const current = $derived(
		last && last.status !== 'done' && last.status !== 'review' ? last : null
	);
	const mine = (t: { assigneeIds: string[] }) => t.assigneeIds.includes(me.id);
	const inProgress = $derived(
		store.tasks.items.filter((t) => t.id !== current?.id && mine(t) && t.status === 'in_progress')
	);
	const toReview = $derived(
		store.tasks.items.filter((t) => t.status === 'review' && t.reviewerId === me.id)
	);
	const doneLately = $derived(
		store.tasks.items
			.filter((t) => t.status === 'done' && mine(t) && t.completedAt)
			.sort((a, b) => b.completedAt!.localeCompare(a.completedAt!))
			.slice(0, 3)
	);
	const resume =
		'relative inline-flex h-9 items-center gap-1.5 rounded-[10px] bg-primary px-3.5 text-ui font-bold text-primary-ink hover:opacity-90';
	const label = 'px-5 pt-3 pb-1.5 text-xs font-bold tracking-[0.06em] text-ink-3 uppercase';
</script>

<Card title="Où tu en étais" padded={false}>
	<div class="divide-y-[1.5px] divide-line/70 border-t-[1.5px] border-line/70">
		{#if current}
			{@const card = sources.card(current)}
			<TaskItem task={card} withPeople={false}>
				{#snippet extra()}
					{#if !card.running}
						<button type="button" class={resume} onclick={() => actions.tasks.start(current.id)}
							><Play size={14} />Reprendre</button
						>
					{/if}
				{/snippet}
			</TaskItem>
		{/if}
		{#each inProgress as task (task.id)}<TaskItem
				task={sources.card(task)}
				withPeople={false}
			/>{/each}
		{#if !current && !inProgress.length}
			<p class="px-5 py-4 text-[15px] text-ink-3">
				Rien en cours. Choisis une Task dans ta matrice et démarre le chrono.
			</p>
		{/if}
	</div>
	{#if toReview.length}
		<p class={label}>À valider par toi</p>
		<div class="divide-y-[1.5px] divide-line/70">
			{#each toReview as task (task.id)}<TaskItem task={sources.card(task)} />{/each}
		</div>
	{/if}
	{#if doneLately.length}
		<p class="border-t-[1.5px] border-line/70 px-5 py-3.5 text-ui text-ink-3">
			Fini dernièrement :
			{#each doneLately as task, i (task.id)}<button
					type="button"
					class="font-semibold text-ink-2 hover:text-ink hover:underline"
					onclick={() => peek(task.ref)}>{task.title}</button
				>{i < doneLately.length - 1 ? ', ' : '.'}{/each}
		</p>
	{/if}
</Card>
