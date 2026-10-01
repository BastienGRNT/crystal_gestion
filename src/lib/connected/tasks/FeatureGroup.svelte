<script lang="ts">
	import { Archive } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import { byPosition } from '$lib/client/views/kanban';
	import { quickTask } from '$lib/client/views/quick-add';
	import type { NewTask } from '$lib/client/actions/tasks';
	import { MOSCOW_LABELS, type Feature } from '$lib/modules/features/domain/feature';
	import { progressOf } from '$lib/modules/tasks/domain/progress';
	import type { Task } from '$lib/modules/tasks/domain/task';
	import Avatar from '$lib/ui/atoms/Avatar.svelte';
	import ProgressRing from '$lib/ui/atoms/ProgressRing.svelte';
	import AddLine from '$lib/ui/molecules/AddLine.svelte';
	import GroupHeader from '$lib/ui/organisms/tasks/GroupHeader.svelte';
	import TaskItem from './TaskItem.svelte';
	import type { TaskSources } from '$lib/client/views/task-sources.svelte';

	interface Props {
		/** `null` groups the tasks and bugs outside any feature. */
		feature: Feature | null;
		tasks: Task[];
		sources: TaskSources;
		defaults: Partial<NewTask>;
	}

	let { feature, tasks, sources, defaults }: Props = $props();
	const { store, actions } = useProject();
	let open = $state(true);
	let showDone = $state(false);
	const ORDER = ['in_progress', 'review', 'todo', 'done'] as const;
	const sorted = $derived(
		[...tasks].sort(
			(a, b) =>
				ORDER.indexOf(a.status as (typeof ORDER)[number]) -
					ORDER.indexOf(b.status as (typeof ORDER)[number]) || byPosition(a, b)
		)
	);
	const done = $derived(sorted.filter((t) => t.status === 'done'));
	const shown = $derived(showDone ? sorted : sorted.filter((t) => t.status !== 'done'));
	const progress = $derived(progressOf(tasks));
	const finished = $derived(!!feature && progress.total > 0 && progress.ratio === 1);
	const owner = $derived(feature?.ownerId ? store.members.get(feature.ownerId) : undefined);
	const meta = $derived(
		feature
			? `${MOSCOW_LABELS[feature.priority]} · ${progress.done}/${progress.total}`
			: 'Tâches et bugs hors feature'
	);
	const add = (text: string) =>
		actions.tasks.create(quickTask(store, text, { ...defaults, featureId: feature?.id ?? null }));
</script>

<section class="mb-5">
	<GroupHeader
		title={feature?.title ?? 'Sans feature'}
		color={feature ? sources.colorOf(feature.id) : undefined}
		href={feature ? `/p/${store.project.slug}/features/${feature.ref}` : undefined}
		{meta}
		{open}
		ontoggle={() => (open = !open)}
	>
		{#snippet aside()}
			{#if finished}
				<button
					type="button"
					onclick={() => actions.features.archive(feature!.id, true)}
					class="inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-accent-text hover:bg-accent-soft"
					><Archive size={13} />Terminée · Archiver</button
				>
			{/if}
			{#if owner}<span title="Responsable : {owner.name}"
					><Avatar name={owner.name} color={owner.color} size={20} /></span
				>{/if}
			{#if feature}<ProgressRing
					ratio={progress.ratio}
					color={sources.colorOf(feature.id)}
					size={16}
				/>{/if}
		{/snippet}
	</GroupHeader>
	{#if open}
		<div class="pt-1">
			{#each shown as task (task.id)}
				<TaskItem task={sources.card(task)} withFeature={false} />
			{/each}
			<AddLine
				label={feature ? 'Ajouter une tâche' : 'Ajouter une tâche ou un bug'}
				placeholder="Une tâche par ligne · @Ana demain"
				onadd={add}
			/>
			{#if done.length}
				<button
					type="button"
					onclick={() => (showDone = !showDone)}
					class="ml-2 text-xs text-ink-3 hover:text-ink"
					>{showDone ? 'Masquer' : 'Voir'}
					{done.length > 1 ? `les ${done.length} tâches faites` : 'la tâche faite'}</button
				>
			{/if}
		</div>
	{/if}
</section>
