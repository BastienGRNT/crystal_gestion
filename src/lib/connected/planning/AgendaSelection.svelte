<script lang="ts">
	import { Check, CircleDashed, Link2Off, Trash2 } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { rangeLabel } from '$lib/client/format';
	import AgendaPopover from '$lib/ui/organisms/agenda/AgendaPopover.svelte';
	import { carriedLabel, isCarried, type Range } from '$lib/client/views/week-plan';
	import type { Task } from '$lib/modules/tasks/domain/task';
	import KindIcon from '$lib/ui/organisms/agenda/KindIcon.svelte';
	import TaskSearch from '$lib/ui/organisms/agenda/TaskSearch.svelte';
	import type { AgendaItem, Point } from '$lib/ui/organisms/agenda/types';
	import type { WeekSlots } from './week-slots.svelte';

	interface Props {
		selection: { item: AgendaItem; point: Point };
		projectId: string;
		/** Tasks to place, offered on my availability. */
		suggestions: Task[];
		/** Lays the task in the free part of the slot. */
		onplace: (taskId: string, slot: Range) => void;
		/** My week as shown, carried-over availability included. */
		weekSlots: WeekSlots;
		onclose: () => void;
	}

	let { selection, projectId, suggestions, onplace, weekSlots, onclose }: Props = $props();
	const { app, actions } = useApp();
	const item = $derived(selection.item);
	const slot = $derived(weekSlots.slot(item.id));
	const carriedFrom = $derived(
		slot && isCarried(slot.id) ? weekSlots.carriedFrom(slot.userId) : undefined
	);
	const block = $derived(app.blocks.get(item.id));
	const range = $derived(slot ?? block);
	const owner = $derived(app.users.get(slot?.userId ?? block?.userId)?.name.split(' ')[0] ?? '');
	const task = $derived(app.tasks.get(block?.taskId));
	const elsewhere = $derived(block && block.projectId !== projectId);
	const what = $derived(
		elsewhere
			? (app.projects.get(block?.projectId)?.name ?? 'Autre projet')
			: (task?.title ?? 'Travail prévu')
	);
	const heading = $derived(
		(slot ? (slot.status === 'maybe' ? 'Peut-être dispo' : 'Dispo') : what) +
			(owner && (slot?.userId ?? block?.userId) !== app.meId ? ` · ${owner}` : '')
	);
	const detail = $derived(
		range
			? `${rangeLabel(range.startsAt, range.endsAt)}${carriedFrom ? ` · ${carriedLabel(carriedFrom)}` : ''}`
			: ''
	);
	/** A change to my carried-over week stores it first, then applies to the stored slot. */
	const mine = (run: (id: string) => unknown) => () => {
		const id = slot?.id;
		if (id) void weekSlots.edit((real) => run(real(id)));
	};
	const options = $derived(
		app.tasks.all
			.filter((t) => t.projectId === projectId && t.status !== 'done' && t.id !== block?.taskId)
			.map((t) => ({ id: t.id, ref: `#${t.number}`, title: t.title }))
	);
	const then = (run: () => unknown) => () => (run(), onclose());
	const choice =
		'flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border text-base font-medium';
	const row =
		'flex h-10 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-base hover:bg-hover';
</script>

{#if slot || block}
	<AgendaPopover point={selection.point} {heading} {detail} {onclose} width={300}>
		{#if slot && item.editable}
			<div class="flex gap-1.5 px-1 py-1">
				<button
					class={[
						choice,
						slot.status === 'available'
							? 'border-accent bg-accent-soft text-accent-text'
							: 'border-line hover:bg-hover'
					]}
					onclick={then(mine((id) => actions.planning.updateSlot(id, { status: 'available' })))}
				>
					<Check size={16} /> Dispo
				</button>
				<button
					class={[
						choice,
						slot.status === 'maybe'
							? 'border-accent bg-accent-soft text-accent-text'
							: 'border-line hover:bg-hover'
					]}
					onclick={then(mine((id) => actions.planning.updateSlot(id, { status: 'maybe' })))}
				>
					<CircleDashed size={16} /> Peut-être
				</button>
			</div>
			{#if suggestions.length}
				<div class="mt-1 border-t border-line pt-1">
					<p class="px-2.5 py-1 text-sm font-medium text-ink-2">Travailler sur :</p>
					{#each suggestions.slice(0, 5) as task (task.id)}
						<button class={row} onclick={then(() => onplace(task.id, slot))}>
							<KindIcon kind={task.kind} critical={task.critical} />
							<span class="shrink-0 font-mono text-sm text-ink-3">#{task.number}</span>
							<span class="truncate">{task.title}</span>
						</button>
					{/each}
				</div>
			{/if}
			<div class="mt-1 border-t border-line pt-1">
				<button
					class={[row, 'text-danger-text hover:bg-danger-soft']}
					onclick={then(mine((id) => actions.planning.removeSlot(id)))}
				>
					<Trash2 size={16} /> Supprimer
				</button>
			</div>
		{:else if block && item.editable}
			{#if task}
				<button
					class={row}
					onclick={then(() => actions.planning.updateBlock(block.id, { taskId: null }))}
				>
					<Link2Off size={16} /> Délier de #{task.number}
				</button>
			{/if}
			<TaskSearch
				tasks={options}
				onpick={(taskId) => then(() => actions.planning.updateBlock(block.id, { taskId }))()}
			/>
			<div class="mt-1 border-t border-line pt-1">
				<button
					class={[row, 'text-danger-text hover:bg-danger-soft']}
					onclick={then(() => actions.planning.removeBlock(block.id))}
				>
					<Trash2 size={16} /> Supprimer
				</button>
			</div>
		{:else if elsewhere}
			<p class="px-2.5 py-2 text-sm text-ink-2">
				{task ? `#${task.number} · ${task.title}. ` : ''}Ce temps est pris sur un autre projet : il
				se change depuis son planning.
			</p>
		{/if}
	</AgendaPopover>
{/if}
