<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { byPosition } from '$lib/client/views/kanban';
	import { quickTask } from '$lib/client/views/quick-add';
	import type { NewTask } from '$lib/client/actions/tasks';
	import type { TaskSources } from '$lib/client/views/task-sources.svelte';
	import { MOSCOW_LABELS, type Feature } from '$lib/modules/features/domain/feature';
	import { progressOf } from '$lib/modules/tasks/domain/progress';
	import type { Task } from '$lib/modules/tasks/domain/task';
	import AddLine from '$lib/ui/molecules/AddLine.svelte';
	import FeatCardHeader from '$lib/ui/organisms/tasks/FeatCardHeader.svelte';
	import { PRIORITY_COLORS } from '$lib/ui/tones';
	import TaskItem from './TaskItem.svelte';

	interface Props {
		/** `null`: the Tasks and Fix outside any feat. */
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
	const rank = (t: Task) => ORDER.indexOf(t.status as (typeof ORDER)[number]);
	const sorted = $derived([...tasks].sort((a, b) => rank(a) - rank(b) || byPosition(a, b)));
	const done = $derived(sorted.filter((t) => t.status === 'done'));
	const shown = $derived(showDone ? sorted : sorted.filter((t) => t.status !== 'done'));
	const progress = $derived(progressOf(tasks));
	const name = $derived(feature?.title ?? 'Sans Feat');
	const add = (text: string, isFix: boolean) =>
		actions.tasks.create(
			quickTask(store, text, { ...defaults, isFix, featureId: feature?.id ?? null })
		);
</script>

<section class="mb-5 overflow-hidden rounded-[18px] border-[1.5px] border-line bg-surface">
	{#if feature}
		<FeatCardHeader
			title={feature.title}
			color={sources.colorOf(feature.id)}
			href="/p/{store.project.slug}/features/{feature.ref}"
			description={feature.description.split('\n')[0]}
			priority={{
				label: MOSCOW_LABELS[feature.priority],
				color: PRIORITY_COLORS[feature.priority]
			}}
			owner={store.members.get(feature.ownerId ?? '') ?? null}
			done={progress.done}
			total={progress.total}
			{open}
			ontoggle={() => (open = !open)}
			onarchive={progress.total && progress.ratio === 1
				? () => actions.features.archive(feature.id, true)
				: undefined}
		/>
	{:else}
		<header class="px-5 py-4">
			<h3 class="text-[19px] font-extrabold tracking-[-0.01em]">Sans Feat</h3>
			<p class="text-ui text-ink-2">Les Tasks et Fix qui ne font partie d’aucune Feat.</p>
		</header>
	{/if}
	{#if open}
		<div class="divide-y-[1.5px] divide-line/70 border-t-[1.5px] border-line/70">
			{#each shown as task (task.id)}
				<TaskItem task={sources.card(task)} withFeature={false} />
			{/each}
			<div class="grid sm:grid-cols-[1fr_auto]">
				<AddLine
					row
					label="Ajouter une Task à {name}"
					placeholder="Une Task par ligne · @Ana demain"
					onadd={(text) => add(text, false)}
				/>
				<div class="border-line/70 sm:w-56 sm:border-l-[1.5px]">
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
	{/if}
</section>
