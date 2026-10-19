<script lang="ts">
	import { Check, CircleDashed, Hammer } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import type { Range } from '$lib/client/views/week-plan';
	import type { Task } from '$lib/modules/tasks/domain/task';
	import AgendaPopover from '$lib/ui/organisms/agenda/AgendaPopover.svelte';
	import KindIcon from '$lib/ui/organisms/agenda/KindIcon.svelte';
	import TaskSearch from '$lib/ui/organisms/agenda/TaskSearch.svelte';
	import type { Point } from '$lib/ui/organisms/agenda/types';
	import { duration } from './agenda-info';
	import type { WeekEdit } from './week-slots.svelte';

	interface Props {
		range: Range;
		point: Point;
		projectId: string;
		/** The first tasks to place, offered without searching. */
		suggestions: Task[];
		/** Stores a carried-over week before the change. */
		edit: WeekEdit;
		onclose: () => void;
	}

	let { range, point, projectId, suggestions, edit, onclose }: Props = $props();
	const { app, actions } = useApp();
	const shown = $derived(suggestions.slice(0, 5));
	const others = $derived(
		app.tasks.all
			.filter(
				(t) => t.projectId === projectId && t.status !== 'done' && !shown.some((s) => s.id === t.id)
			)
			.map((t) => ({ id: t.id, ref: `#${t.number}`, title: t.title }))
	);
	const label = new Intl.DateTimeFormat('fr-FR', {
		weekday: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit'
	});
	const detail = $derived(
		`${label.format(new Date(range.startsAt))} · ${duration(range.startsAt, range.endsAt)}`
	);
	// The range is read now: the popover is gone by the time a carried week is stored.
	const done = (run: (range: Range, projectId: string) => unknown) => () => {
		const [drawn, project] = [range, projectId];
		void edit(() => run(drawn, project));
		onclose();
	};
	const work = (taskId: string | null) =>
		done((drawn, project) => actions.planning.createBlock(project, drawn, taskId));
	const big =
		'flex h-12 flex-1 items-center justify-center gap-2 rounded-xl text-base font-semibold transition-colors';
	const row =
		'flex h-10 w-full items-center gap-2 rounded-md px-2.5 text-left text-base hover:bg-sunken';
</script>

<AgendaPopover {point} heading="Ce créneau :" {detail} {onclose} width={320}>
	<div class="flex gap-2 px-1.5 pt-1 pb-2">
		<button
			type="button"
			class="{big} bg-accent text-accent-ink hover:bg-accent-hover"
			onclick={done((drawn) => actions.planning.createSlot(drawn, 'available'))}
		>
			<Check size={18} aria-hidden="true" /> Je suis dispo
		</button>
		<button
			type="button"
			class="{big} border border-dashed border-accent text-accent-text hover:bg-accent-soft"
			onclick={done((drawn) => actions.planning.createSlot(drawn, 'maybe'))}
		>
			<CircleDashed size={18} aria-hidden="true" /> Peut-être
		</button>
	</div>
	<div class="border-t border-line pt-2">
		<p class="px-2.5 pb-1 text-sm font-medium text-ink-2">Ou travailler sur :</p>
		{#each shown as task (task.id)}
			<button type="button" class={row} onclick={work(task.id)}>
				<KindIcon kind={task.kind} critical={task.critical} />
				<span class="shrink-0 font-mono text-sm text-ink-3">#{task.number}</span>
				<span class="truncate">{task.title}</span>
			</button>
		{/each}
		<TaskSearch tasks={others} idle={0} onpick={(id) => work(id)()} />
		<button type="button" class="{row} text-ink-2" onclick={work(null)}>
			<Hammer size={15} class="text-ink-3" aria-hidden="true" /> Du travail, sans tâche précise
		</button>
	</div>
</AgendaPopover>
