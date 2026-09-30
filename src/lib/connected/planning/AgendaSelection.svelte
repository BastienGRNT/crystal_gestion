<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { formatDay, formatTime } from '$lib/client/format';
	import { isDone } from '$lib/modules/tasks/domain/task';
	import AgendaPopover from '$lib/ui/organisms/agenda/AgendaPopover.svelte';
	import AvailabilityMenu from '$lib/ui/organisms/agenda/AvailabilityMenu.svelte';
	import BlockMenu from '$lib/ui/organisms/agenda/BlockMenu.svelte';
	import type { AgendaItem } from '$lib/ui/organisms/agenda/types';

	type Selection = { item: AgendaItem; point: { x: number; y: number } };
	let { selection, onclose }: { selection: Selection; onclose: () => void } = $props();
	const { store, actions, me } = useProject();
	const { planning } = actions;
	const item = $derived(selection.item);
	const slot = $derived(store.availabilities.get(item.id));
	const entry = $derived(store.timeEntries.get(item.id));
	const range = $derived(
		slot ? [slot.startsAt, slot.endsAt] : entry ? [entry.startedAt, entry.endedAt] : []
	);
	const owner = $derived(store.members.get(slot?.userId ?? entry?.userId ?? '')?.name ?? '');
	const task = $derived(entry?.taskId ? store.tasks.get(entry.taskId) : undefined);
	const heading = $derived(
		(slot ? (item.maybe ? 'Peut-être' : 'Dispo') : (task?.title ?? 'Bloc de travail')) +
			(owner && owner !== me.name ? ` · ${owner}` : '')
	);
	const detail = $derived(
		range[0]
			? `${formatDay(range[0], { weekday: 'short', day: 'numeric', month: 'short' })} · ${formatTime(range[0])}–${range[1] ? formatTime(range[1]) : 'en cours'}`
			: ''
	);
	const tasks = $derived(
		[...store.tasks.items].sort((a, b) => Number(isDone(a)) - Number(isDone(b)))
	);
	const then = (run: () => unknown) => () => (run(), onclose());
</script>

{#if slot || entry}
	<AgendaPopover point={selection.point} {heading} {detail} {onclose}>
		{#if slot && item.editable}
			<AvailabilityMenu
				maybe={slot.status === 'maybe'}
				onstatus={(maybe) =>
					then(() =>
						planning.updateAvailability(slot.id, { status: maybe ? 'maybe' : 'available' })
					)()}
				onremove={then(() => planning.removeAvailability(slot.id))}
			/>
		{:else if entry && item.editable}
			<BlockMenu
				{tasks}
				linked={task ?? null}
				onlink={(taskId) => then(() => planning.updateBlock(entry.id, { taskId }))()}
				onremove={then(() => planning.removeBlock(entry.id))}
			/>
		{/if}
	</AgendaPopover>
{/if}
