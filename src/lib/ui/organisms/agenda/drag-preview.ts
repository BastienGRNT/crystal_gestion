import { MINUTES_PER_DAY, snap } from '$lib/modules/planning/domain/calendar';
import {
	absoluteMinutes as abs,
	moveRange,
	rangeBetween,
	resizeEnd,
	resizeStart,
	toDayRange
} from '$lib/modules/planning/domain/grid';
import type { AgendaDraft, AgendaItem, AgendaLayer, DragMode } from './types';

export interface DragOrigin {
	mode: DragMode;
	layer: AgendaLayer;
	lane: number;
	day: number;
	minutes: number;
	item: AgendaItem | null;
}

/** Where the dragged (or drawn) range would land with the pointer at `at`; it may cross midnight. */
export function previewAt(
	origin: DragOrigin,
	at: { day: number; minutes: number },
	days: number
): AgendaDraft {
	const { item } = origin;
	const base = { id: item?.id ?? null, layer: origin.layer, lane: origin.lane };
	const limit = days * MINUTES_PER_DAY;
	const pointer = abs(at.day, snap(at.minutes));
	if (!item)
		return {
			...base,
			...toDayRange(rangeBetween(abs(origin.day, snap(origin.minutes)), pointer, limit))
		};
	const [start, end] = [abs(item.day, item.start), abs(item.day, item.end)];
	if (origin.mode === 'move') {
		const to = snap(start + abs(at.day, at.minutes) - abs(origin.day, origin.minutes));
		return { ...base, ...toDayRange(moveRange(start, end, to, limit)) };
	}
	if (origin.mode === 'start')
		return { ...base, ...toDayRange({ start: resizeStart(end, pointer), end }) };
	return { ...base, ...toDayRange({ start, end: resizeEnd(start, pointer, limit) }) };
}

/** Shifts (in minutes) to apply to the item's real start and end to match the preview. */
export function shiftsTo(item: AgendaItem, draft: AgendaDraft): [number, number] {
	const days = (draft.day - item.day) * MINUTES_PER_DAY;
	return [draft.start - item.start + days, draft.end - item.end + days];
}

/** The part of a draft drawn in column `day` (a draft crossing midnight shows in two columns). */
export function draftIn(draft: AgendaDraft | null, day: number): AgendaDraft | null {
	if (!draft) return null;
	if (draft.day === day) return { ...draft, end: Math.min(draft.end, MINUTES_PER_DAY) };
	if (draft.day + 1 === day && draft.end > MINUTES_PER_DAY)
		return { ...draft, day, start: 0, end: draft.end - MINUTES_PER_DAY };
	return null;
}
