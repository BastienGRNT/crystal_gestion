<script lang="ts">
	import { Check, CircleDashed, Link2Off, Trash2 } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { rangeLabel } from '$lib/client/format';
	import AgendaPopover from '$lib/ui/organisms/agenda/AgendaPopover.svelte';
	import TaskSearch from '$lib/ui/organisms/agenda/TaskSearch.svelte';
	import type { AgendaItem } from '$lib/ui/organisms/agenda/types';

	type Selection = { item: AgendaItem; point: { x: number; y: number } };
	let {
		selection,
		projectId,
		onclose
	}: { selection: Selection; projectId: string; onclose: () => void } = $props();
	const { app, actions } = useApp();
	const item = $derived(selection.item);
	const slot = $derived(app.slots.get(item.id));
	const block = $derived(app.blocks.get(item.id));
	const range = $derived(slot ?? block);
	const owner = $derived(app.users.get(slot?.userId ?? block?.userId)?.name.split(' ')[0] ?? '');
	const task = $derived(app.tasks.get(block?.taskId));
	const heading = $derived(
		(slot
			? slot.status === 'maybe'
				? 'Peut-être dispo'
				: 'Dispo'
			: (task?.title ?? 'Travail prévu')) +
			(owner && (slot?.userId ?? block?.userId) !== app.meId ? ` · ${owner}` : '')
	);
	const detail = $derived(range ? rangeLabel(range.startsAt, range.endsAt) : '');
	const options = $derived(
		app.tasks.all
			.filter((t) => t.projectId === projectId && t.status !== 'done' && t.id !== block?.taskId)
			.map((t) => ({ id: t.id, ref: `#${t.number}`, title: t.title }))
	);
	const then = (run: () => unknown) => () => (run(), onclose());
	const row =
		'flex h-10 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-base hover:bg-hover';
</script>

{#if slot || block}
	<AgendaPopover point={selection.point} {heading} {detail} {onclose}>
		{#if slot && item.editable}
			<button
				class={row}
				onclick={then(() => actions.planning.updateSlot(slot.id, { status: 'available' }))}
			>
				<Check size={16} class={slot.status === 'maybe' ? 'opacity-0' : 'text-accent'} /> Dispo
			</button>
			<button
				class={row}
				onclick={then(() => actions.planning.updateSlot(slot.id, { status: 'maybe' }))}
			>
				<CircleDashed size={16} class={slot.status === 'maybe' ? 'text-accent' : 'opacity-40'} /> Peut-être
			</button>
			<button
				class={[row, 'text-danger-text hover:bg-danger-soft']}
				onclick={then(() => actions.planning.removeSlot(slot.id))}
			>
				<Trash2 size={16} /> Supprimer
			</button>
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
		{/if}
	</AgendaPopover>
{/if}
