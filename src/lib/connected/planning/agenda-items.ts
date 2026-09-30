import { isDraft } from '$lib/client/live/optimistic';
import { daySegment } from '$lib/modules/planning/domain/calendar';
import type { Availability } from '$lib/modules/planning/domain/availability';
import { layoutGroups } from '$lib/modules/planning/domain/layout';
import type { TimeEntry } from '$lib/modules/time/domain/time-entry';
import type { AgendaItem, AgendaLane } from '$lib/ui/organisms/agenda/types';

export interface AgendaSource {
	days: Date[];
	lanes: AgendaLane[];
	team: boolean;
	meId: string;
	now: Date;
	availabilities: Availability[];
	entries: TimeEntry[];
	taskOf: (id: string | null) => { ref: string; title: string } | undefined;
}

type Base = Pick<AgendaItem, 'id' | 'lane' | 'color' | 'editable'>;
type Placed = 'start' | 'end' | 'clippedStart' | 'clippedEnd' | 'day' | 'column' | 'columns';
type Raw = Omit<AgendaItem, Placed>;

function rawItems(s: AgendaSource): (Raw & { from: string; to: string })[] {
	const laneOf = new Map(s.lanes.map((lane, index) => [lane.id, { ...lane, index }]));
	const base = (id: string, userId: string): Base => ({
		id,
		lane: laneOf.get(userId)?.index ?? -1,
		color: s.team ? (laneOf.get(userId)?.color ?? null) : null,
		editable: userId === s.meId && !isDraft(id)
	});
	const slots = s.availabilities.map((a) => ({
		...base(a.id, a.userId),
		...{
			layer: 'availability' as const,
			running: false,
			ref: null,
			from: a.startsAt,
			to: a.endsAt
		},
		...{ maybe: a.status === 'maybe', label: s.team ? (laneOf.get(a.userId)?.name ?? '') : 'Dispo' }
	}));
	const blocks = s.entries.map((e) => ({
		...base(e.id, e.userId),
		...{ layer: 'block' as const, maybe: false, running: e.endedAt === null, from: e.startedAt },
		...{ to: e.endedAt ?? s.now.toISOString(), ref: s.taskOf(e.taskId)?.ref ?? null },
		label: s.taskOf(e.taskId)?.title ?? 'Travail'
	}));
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
