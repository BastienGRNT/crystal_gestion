<script lang="ts">
	import { Search } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { dnd } from '$lib/client/dnd.svelte';
	import { plural } from '$lib/client/format';
	import { BOXES } from '$lib/client/labels';
	import { now } from '$lib/client/now.svelte';
	import { score } from '$lib/client/views/search';
	import { teamOf } from '$lib/client/views/workspace';
	import { positionAt } from '$lib/modules/tasks/domain/position';
	import type { Project } from '$lib/modules/projects/domain/project';
	import type { Quadrant, Task, TaskStatus } from '$lib/modules/tasks/domain/task';
	import { boardOf, PRIORITY_ORDER, WIP_PER_PERSON } from '$lib/modules/tasks/domain/views';
	import InlineAdd from '$lib/ui/molecules/InlineAdd.svelte';
	import { projectTasks } from '../projects/current.svelte';
	import BoardColumn from './BoardColumn.svelte';
	import CardZone from './CardZone.svelte';
	import { personFilter } from './filter.svelte';
	import PersonFilter from './PersonFilter.svelte';
	import { QUICK_HINT, quickAdd } from './quick-add';

	let { project }: { project: Project } = $props();
	const context = useApp();
	const { app, actions } = context;
	let showAllDone = $state(false);
	let showIdeas = $state(false);
	let query = $state('');

	const matches = (t: Task) => score(`${t.title} #${t.number}`, query) !== null;
	const tasks = $derived(personFilter.apply(projectTasks(app, project.id)).filter(matches));
	const board = $derived(boardOf(tasks, now.value, showAllDone));
	const limit = $derived(Math.max(1, teamOf(app.members.all, project.id).length) * WIP_PER_PERSON);
	const groupKey = (q: Quadrant | null) => q ?? 'inbox';
	const groups = $derived(
		PRIORITY_ORDER.map((quadrant) => ({
			quadrant,
			tasks: board.columns.todo.filter((t) => t.quadrant === quadrant)
		}))
	);

	/** Dropping keeps the order chosen; in "À faire" the group chosen is the priority. */
	function dropInto(status: TaskStatus, quadrant?: Quadrant | null) {
		return (taskId: string, index: number) => {
			const list =
				status === 'todo'
					? board.columns.todo.filter((t) => t.quadrant === quadrant)
					: board.columns[status];
			const others = list.filter((t) => t.id !== taskId).map((t) => t.position);
			actions.tasks.update(taskId, {
				status,
				...(status === 'todo' && { quadrant: quadrant ?? null }),
				...(status !== 'done' && status !== 'idea' && { position: positionAt(others, index) })
			});
		};
	}

	const add = (status: TaskStatus) => (text: string) =>
		quickAdd(context, text, {
			projectId: project.id,
			status,
			assigneeId: status === 'doing' ? app.meId : personFilter.value
		});
</script>

<div class="flex flex-wrap items-center gap-3 px-4 pb-4 sm:px-8">
	<label class="relative w-full sm:w-72">
		<Search
			size={17}
			class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-3"
			aria-hidden="true"
		/>
		<input
			bind:value={query}
			type="search"
			placeholder="Filtrer les cartes (titre ou #12)"
			class="h-11 w-full rounded-xl border border-line-strong/70 bg-surface pr-3 pl-10 text-base shadow-card outline-none focus:border-accent focus:ring-4 focus:ring-accent-soft"
		/>
	</label>
	<PersonFilter projectId={project.id} />
</div>

<!-- Columns scroll on their own; the board scrolls sideways on small screens. -->
<div
	data-scroll-x
	class="flex min-h-0 flex-1 scrollbar-thin gap-3 overflow-x-auto px-4 pb-4 max-sm:snap-x sm:px-8"
>
	<BoardColumn
		title="Idées"
		count={board.columns.idea.length}
		hint="De côté, pour ne plus y penser."
		dot="bg-warn"
		zones={['idea']}
		collapsed={!showIdeas && !dnd.active}
		ontoggle={() => (showIdeas = !showIdeas)}
	>
		<CardZone
			zone="idea"
			tasks={board.columns.idea}
			ondrop={dropInto('idea')}
			showPriority={false}
		/>
		{#snippet footer()}<InlineAdd
				label="Noter une idée"
				placeholder="L’idée, puis Entrée"
				onadd={add('idea')}
			/>{/snippet}
	</BoardColumn>

	<BoardColumn
		title="À faire"
		count={board.columns.todo.length}
		hint="Prêt à prendre, le plus important en haut."
		dot="border-2 border-ink-4"
		zones={PRIORITY_ORDER.map((q) => `todo:${groupKey(q)}`)}
	>
		<div class="flex flex-col gap-3">
			{#each groups as group (groupKey(group.quadrant))}
				{@const box = BOXES[groupKey(group.quadrant)]}
				{#if group.tasks.length || dnd.active}
					<div class="flex flex-col gap-2">
						<p
							class={[
								'flex items-center gap-1.5 px-1 pt-1 text-xs font-semibold tracking-wide uppercase',
								box.text
							]}
						>
							<span class={['size-2 rounded-full', box.dot]}></span>{box.label}
							<span class="font-medium text-ink-3">{group.tasks.length || ''}</span>
						</p>
						<CardZone
							zone="todo:{groupKey(group.quadrant)}"
							tasks={group.tasks}
							ondrop={dropInto('todo', group.quadrant)}
							showPriority={false}
							emptyLabel="Dépose ici : {box.label.toLowerCase()}"
						/>
					</div>
				{/if}
			{/each}
		</div>
		{#snippet footer()}<InlineAdd
				label="Ajouter une tâche"
				hint={QUICK_HINT}
				onadd={add('todo')}
			/>{/snippet}
	</BoardColumn>

	<BoardColumn
		title="En cours"
		count={board.columns.doing.length}
		{limit}
		hint="{WIP_PER_PERSON} par personne au plus."
		dot="bg-accent"
		zones={['doing']}
	>
		<CardZone zone="doing" tasks={board.columns.doing} ondrop={dropInto('doing')} />
	</BoardColumn>

	<BoardColumn
		title="En revue"
		count={board.columns.review.length}
		hint="L’autre vérifie, puis c’est terminé."
		dot="bg-plan"
		zones={['review']}
	>
		<CardZone zone="review" tasks={board.columns.review} ondrop={dropInto('review')} />
	</BoardColumn>

	<BoardColumn
		title="Terminé"
		count={board.columns.done.length}
		hint="Les 14 derniers jours."
		dot="bg-ok"
		zones={['done']}
	>
		<CardZone
			zone="done"
			tasks={board.columns.done}
			ondrop={dropInto('done')}
			showPriority={false}
		/>
		{#snippet footer()}
			{#if board.olderDone || showAllDone}
				<button
					class="h-10 w-full rounded-xl text-sm text-ink-3 hover:bg-hover hover:text-ink-2"
					onclick={() => (showAllDone = !showAllDone)}
				>
					{showAllDone
						? 'Ne garder que les 14 derniers jours'
						: `Voir ${plural(board.olderDone, 'tâche plus ancienne', 'tâches plus anciennes')}`}
				</button>
			{/if}
		{/snippet}
	</BoardColumn>
</div>
