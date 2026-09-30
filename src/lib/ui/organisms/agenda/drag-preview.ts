import { clamp, MINUTES_PER_DAY, SNAP_MINUTES, snap } from '$lib/modules/planning/domain/calendar';
import { moveRange, rangeBetween } from '$lib/modules/planning/domain/grid';
import type { AgendaDraft, AgendaItem, AgendaLayer, DragMode } from './types';

export interface DragOrigin {
	mode: DragMode;
	layer: AgendaLayer;
	lane: number;
	day: number;
	minutes: number;
	item: AgendaItem | null;
}

/** Where the dragged (or drawn) range would land with the pointer at `at`. */
export function previewAt(origin: DragOrigin, at: { day: number; minutes: number }): AgendaDraft {
	const { item } = origin;
	const base = { id: item?.id ?? null, layer: origin.layer, lane: origin.lane };
	if (!item)
		return { ...base, day: origin.day, ...rangeBetween(snap(origin.minutes), snap(at.minutes)) };
	const pointer = snap(at.minutes);
	if (origin.mode === 'move') {
		const to = snap(item.start + at.minutes - origin.minutes);
		return { ...base, day: at.day, ...moveRange(item.start, item.end, to) };
	}
	if (origin.mode === 'start')
		return {
			...base,
			day: item.day,
			start: clamp(pointer, 0, item.end - SNAP_MINUTES),
			end: item.end
		};
	return {
		...base,
		day: item.day,
		start: item.start,
		end: clamp(pointer, item.start + SNAP_MINUTES, MINUTES_PER_DAY)
	};
}

/** Shifts (in minutes) to apply to the item's real start and end to match the preview. */
export function shiftsTo(item: AgendaItem, draft: AgendaDraft): [number, number] {
	const days = (draft.day - item.day) * MINUTES_PER_DAY;
	return [draft.start - item.start + days, draft.end - item.end + days];
}
