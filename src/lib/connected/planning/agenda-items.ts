import { daySegment } from '$lib/modules/planning/domain/calendar';
import type { AvailabilitySlot, WorkBlock } from '$lib/modules/planning/domain/availability';
import { layoutGroups } from '$lib/modules/planning/domain/layout';
import type { AgendaItem, AgendaLane } from '$lib/ui/organisms/agenda/types';
import { blockInfo, slotInfo } from './agenda-info';

export interface AgendaSource {
	days: Date[];
	lanes: AgendaLane[];
	meId: string;
	slots: AvailabilitySlot[];
	blocks: WorkBlock[];
	taskOf: (id: string | null) => { number: number; title: string } | undefined;
	isDraft: (id: string) => boolean;
}

type Raw = Omit<
	AgendaItem,
	'start' | 'end' | 'clippedStart' | 'clippedEnd' | 'day' | 'column' | 'columns'
> & {
	from: string;
	to: string;
};

function rawItems(s: AgendaSource): Raw[] {
	const laneOf = new Map(s.lanes.map((lane, index) => [lane.id, { ...lane, index }]));
	const base = (id: string, userId: string) => ({
		id,
		lane: laneOf.get(userId)?.index ?? -1,
		editable: userId === s.meId && !s.isDraft(id)
	});
	const person = (id: string) => laneOf.get(id)?.name ?? '';
	const color = (id: string) => laneOf.get(id)?.color ?? 'var(--accent)';
	const slots: Raw[] = s.slots.map((slot) => ({
		...base(slot.id, slot.userId),
		layer: 'availability',
		color: color(slot.userId),
		info: slotInfo(slot, person(slot.userId)),
		maybe: slot.status === 'maybe',
		running: false,
		label: s.lanes.length > 1 ? person(slot.userId) : 'Dispo',
		ref: null,
		from: slot.startsAt,
		to: slot.endsAt
	}));
	const blocks: Raw[] = s.blocks.map((block) => {
		const task = s.taskOf(block.taskId);
		return {
			...base(block.id, block.userId),
			layer: 'block',
			color: color(block.userId),
			info: blockInfo(block, task, person(block.userId), s.slots),
			maybe: false,
			running: false,
			label: task?.title ?? 'Travail',
			ref: task ? `#${task.number}` : null,
			from: block.startsAt,
			to: block.endsAt
		};
	});
	return [...slots, ...blocks].filter((item) => item.lane >= 0);
}

/** Store data → what the grid draws: split per day, overlapping items of a lane side by side. */
export function agendaItems(source: AgendaSource): AgendaItem[] {
	const raw = rawItems(source);
	const items = source.days.flatMap((day, index) =>
		raw.flatMap(({ from, to, ...item }) => {
			const segment = daySegment(day, from, to);
			return segment ? [{ ...item, ...segment, day: index, column: 0, columns: 1 }] : [];
		})
	);
	return layoutGroups(items, (item) => `${item.day}/${item.lane}/${item.layer}`);
}
