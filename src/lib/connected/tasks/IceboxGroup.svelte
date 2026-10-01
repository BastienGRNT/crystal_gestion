<script lang="ts">
	import { ArrowUpRight, Layers } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import { quickTask } from '$lib/client/views/quick-add';
	import type { TaskSources } from '$lib/client/views/task-sources.svelte';
	import type { NewTask } from '$lib/client/actions/tasks';
	import type { Feature } from '$lib/modules/features/domain/feature';
	import type { Task } from '$lib/modules/tasks/domain/task';
	import AddLine from '$lib/ui/molecules/AddLine.svelte';
	import GroupHeader from '$lib/ui/organisms/tasks/GroupHeader.svelte';
	import TaskItem from './TaskItem.svelte';

	interface Props {
		features: Feature[];
		tasks: Task[];
		sources: TaskSources;
		defaults: Partial<NewTask>;
	}

	/** Feature ideas and tasks for later: noted, not thought about yet. */
	let { features, tasks, sources, defaults }: Props = $props();
	const { store, actions } = useProject();
	let open = $state(true);
	const count = $derived(features.length + tasks.length);
	const promote =
		'relative inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium text-ink-2 opacity-0 group-hover:opacity-100 hover:bg-sunken hover:text-ink max-sm:opacity-100';
</script>

<section class="mb-5">
	<GroupHeader
		title="Icebox"
		meta="{count} · idées de features et tâches pour plus tard"
		{open}
		ontoggle={() => (open = !open)}
	/>
	{#if open}
		<div class="pt-1">
			{#each features as feature (feature.id)}
				<div
					class="group relative flex min-h-10 items-center gap-2.5 rounded-lg pr-1 pl-2 hover:bg-hover"
				>
					<Layers size={15} class="shrink-0 text-ink-3" />
					<a
						href="/p/{store.project.slug}/features/{feature.ref}"
						class="min-w-0 flex-1 truncate text-sm after:absolute after:inset-0">{feature.title}</a
					>
					<span class="text-xs text-ink-3">Feature</span>
					<button
						type="button"
						class={promote}
						onclick={() => actions.features.update(feature.id, { priority: 'should' })}
						>Lancer<ArrowUpRight size={13} /></button
					>
				</div>
			{/each}
			{#each tasks as task (task.id)}
				<TaskItem task={sources.card(task)}>
					{#snippet extra()}
						<button
							type="button"
							class={promote}
							onclick={() => actions.tasks.move(task.id, 'todo')}
							>À faire<ArrowUpRight size={13} /></button
						>
					{/snippet}
				</TaskItem>
			{/each}
			<AddLine
				label="Noter pour plus tard"
				placeholder="Une idée pour le produit · #feature"
				onadd={(text) =>
					actions.tasks.create(quickTask(store, text, { ...defaults, status: 'icebox' }))}
			/>
		</div>
	{/if}
</section>
