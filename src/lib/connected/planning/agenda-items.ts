import { daySegment } from '$lib/modules/planning/domain/calendar';
import type { AvailabilitySlot, WorkBlock } from '$lib/modules/planning/domain/availability';
import { layoutGroups } from '$lib/modules/planning/domain/layout';
import type { AgendaItem, AgendaLane } from '$lib/ui/organisms/agenda/types';
import { capitalize, initials } from '$lib/client/format';
import { carriedLabel, isCarried } from '$lib/client/views/week-plan';
import { blockInfo, slotInfo } from './agenda-info';

export interface AgendaSource {
	days: Date[];
	lanes: AgendaLane[];
	meId: string;
	slots: AvailabilitySlot[];
	/** Every block of these people: other projects' too, since that time is taken. */
	blocks: WorkBlock[];
	projectId: string;
	projectName: (id: string) => string;
	taskOf: (id: string | null) => { number: number; title: string } | undefined;
	isDraft: (id: string) => boolean;
	/** Monday of the week someone's availability is carried from, when it is. */
	carriedFrom: (userId: string) => Date | undefined;
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
	const base = (id: string, userId: string, here = true) => ({
		id,
		lane: laneOf.get(userId)?.index ?? -1,
		editable: here && userId === s.meId && !s.isDraft(id),
		muted: !here
	});
	const person = (id: string) => laneOf.get(id)?.name ?? '';
	const color = (id: string) => laneOf.get(id)?.color ?? 'var(--accent)';
	const slots: Raw[] = s.slots.map((slot) => {
		const info = slotInfo(slot, person(slot.userId));
		const from = isCarried(slot.id) ? s.carriedFrom(slot.userId) : undefined;
		const label = s.lanes.length > 1 ? person(slot.userId) : 'Dispo';
		return {
			...base(slot.id, slot.userId),
			layer: 'availability',
			color: color(slot.userId),
			info: from ? { ...info, lines: [...info.lines, capitalize(carriedLabel(from))] } : info,
			maybe: slot.status === 'maybe',
			carried: !!from,
			running: false,
			label,
			short: label,
			ref: null,
			from: slot.startsAt,
			to: slot.endsAt
		};
	});
	const blocks: Raw[] = s.blocks.map((block) => {
		const here = block.projectId === s.projectId;
		const task = s.taskOf(block.taskId);
		const project = s.projectName(block.projectId);
		const info = blockInfo(block, task, person(block.userId), s.slots);
		return {
			...base(block.id, block.userId, here),
			layer: 'block',
			color: color(block.userId),
			info: here
				? info
				: {
						title: project,
						lines: [
							...(task ? [`#${task.number} · ${task.title}`] : []),
							...info.lines,
							'À changer depuis le planning de ce projet'
						]
					},
			maybe: false,
			carried: false,
			running: false,
			label: here ? (task?.title ?? 'Travail') : project,
			short: task && here ? `#${task.number}` : here ? 'Trav.' : initials(project),
			ref: here && task ? `#${task.number}` : null,
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
