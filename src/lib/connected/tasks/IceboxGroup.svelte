<script lang="ts">
	import { ArrowUpRight, Layers, Snowflake } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import { quickTask } from '$lib/client/views/quick-add';
	import type { TaskSources } from '$lib/client/views/task-sources.svelte';
	import type { NewTask } from '$lib/client/actions/tasks';
	import type { Feature } from '$lib/modules/features/domain/feature';
	import type { Task } from '$lib/modules/tasks/domain/task';
	import AddLine from '$lib/ui/molecules/AddLine.svelte';
	import TaskItem from './TaskItem.svelte';

	interface Props {
		features: Feature[];
		tasks: Task[];
		sources: TaskSources;
		defaults: Partial<NewTask>;
	}

	/** Feat ideas and tasks for later: noted, not thought about yet. One click brings them back. */
	let { features, tasks, sources, defaults }: Props = $props();
	const { store, actions } = useProject();
	const promote =
		'relative inline-flex h-8 items-center gap-1.5 rounded-lg border-[1.5px] border-line-strong bg-surface px-2.5 text-xs font-bold text-ink-2 opacity-0 group-hover:opacity-100 hover:border-ink-3 hover:text-ink max-sm:opacity-100';
</script>

<section
	class="mb-5 overflow-hidden rounded-[18px] border-[1.5px] border-dashed border-line-strong"
>
	<header class="flex items-center gap-3 px-5 py-4">
		<Snowflake size={20} class="text-ink-3" />
		<div>
			<h3 class="text-[19px] font-extrabold tracking-[-0.01em]">Icebox</h3>
			<p class="text-ui text-ink-2">Les idées de Feats et les Tasks pour plus tard.</p>
		</div>
	</header>
	<div class="divide-y-[1.5px] divide-line/70 border-t-[1.5px] border-line/70">
		{#each features as feature (feature.id)}
			<div class="group relative flex min-h-[52px] items-center gap-3.5 px-5 hover:bg-hover">
				<Layers size={20} class="shrink-0 text-ink-3" />
				<span class="shrink-0 text-xs font-bold text-ink-3">Feat</span>
				<a
					href="/p/{store.project.slug}/features/{feature.ref}"
					class="min-w-0 flex-1 truncate text-[15px] after:absolute after:inset-0"
					>{feature.title}</a
				>
				<button
					type="button"
					class={promote}
					onclick={() => actions.features.update(feature.id, { priority: 'should' })}
					>Lancer cette Feat<ArrowUpRight size={14} /></button
				>
			</div>
		{/each}
		{#each tasks as task (task.id)}
			<TaskItem task={sources.card(task)}>
				{#snippet extra()}
					<button type="button" class={promote} onclick={() => actions.tasks.move(task.id, 'todo')}
						>Passer en À faire<ArrowUpRight size={14} /></button
					>
				{/snippet}
			</TaskItem>
		{/each}
		<AddLine
			row
			label="Noter une idée de Feat ou une Task pour plus tard"
			placeholder="Ex. Mode sombre pour la boutique"
			onadd={(text) =>
				actions.tasks.create(quickTask(store, text, { ...defaults, status: 'icebox' }))}
		/>
	</div>
</section>
