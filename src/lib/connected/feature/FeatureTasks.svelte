<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { byPosition } from '$lib/client/views/kanban';
	import { quickTask } from '$lib/client/views/quick-add';
	import { TaskSources } from '$lib/client/views/task-sources.svelte';
	import AddLine from '$lib/ui/molecules/AddLine.svelte';
	import TaskItem from '../tasks/TaskItem.svelte';

	/** The feat broken down: open tasks first, type to add the next one, done ones on demand. */
	let { featureId }: { featureId: string } = $props();
	const { store, actions } = useProject();
	const sources = new TaskSources(store);
	const ORDER = ['in_progress', 'review', 'todo', 'icebox', 'done'] as const;
	let showDone = $state(false);
	const tasks = $derived(
		store.tasks.items
			.filter((task) => task.featureId === featureId)
			.sort((a, b) => ORDER.indexOf(a.status) - ORDER.indexOf(b.status) || byPosition(a, b))
	);
	const done = $derived(tasks.filter((t) => t.status === 'done'));
	const shown = $derived(showDone ? tasks : tasks.filter((t) => t.status !== 'done'));
	const add = (text: string, isFix: boolean) =>
		actions.tasks.create(quickTask(store, text, { featureId, isFix, assigneeIds: [] }));
</script>

<section class="overflow-hidden rounded-[18px] border-[1.5px] border-line bg-surface">
	<div class="divide-y-[1.5px] divide-line/70">
		{#each shown as task (task.id)}<TaskItem task={sources.card(task)} withFeature={false} />{/each}
		<div class="grid sm:grid-cols-[1fr_auto]">
			<AddLine
				row
				label="Ajouter une Task"
				placeholder="Une Task par ligne · @Ana demain"
				onadd={(text) => add(text, false)}
			/>
			<div class="border-line/70 sm:w-52 sm:border-l-[1.5px]">
				<AddLine
					row
					label="Ajouter un Fix"
					placeholder="Ce qu’il faut corriger"
					onadd={(text) => add(text, true)}
				/>
			</div>
		</div>
	</div>
	{#if done.length}
		<button
			type="button"
			onclick={() => (showDone = !showDone)}
			class="w-full border-t-[1.5px] border-line/70 px-5 py-2.5 text-left text-xs font-semibold text-ink-3 hover:text-ink"
			>{showDone ? 'Masquer' : 'Voir'}
			{done.length > 1 ? `les ${done.length} faites` : 'celle qui est faite'}</button
		>
	{/if}
</section>
