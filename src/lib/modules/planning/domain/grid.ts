import { clamp, MINUTES_PER_DAY, SNAP_MINUTES, snap } from './calendar';

/** Vertical scale of the agenda: how many pixels an hour takes. */
export interface GridScale {
	hourHeight: number;
}

export const minutesToPx = (minutes: number, { hourHeight }: GridScale) =>
	(minutes / 60) * hourHeight;

export const pxToMinutes = (px: number, { hourHeight }: GridScale) => (px / hourHeight) * 60;

/** Pointer offset inside a day column → snapped minute of the day, kept inside the day. */
export const pxToSnappedMinutes = (px: number, scale: GridScale) =>
	clamp(snap(pxToMinutes(px, scale)), 0, MINUTES_PER_DAY);

/** Which of `count` equal-width columns an x offset falls into. */
export const columnAt = (x: number, width: number, count: number) =>
	clamp(Math.floor((x / Math.max(width, 1)) * count), 0, count - 1);

/**
 * Gestures work in minutes counted from the first displayed day, so a range can run past midnight
 * into the next column. `limit` is the end of the last displayed day.
 */
export const absoluteMinutes = (day: number, minutes: number) => day * MINUTES_PER_DAY + minutes;

/** Back to "day index + minutes of that day"; `end` may exceed a day when the range crosses midnight. */
export function toDayRange({ start, end }: { start: number; end: number }) {
	const day = Math.floor(start / MINUTES_PER_DAY);
	return { day, start: start - day * MINUTES_PER_DAY, end: end - day * MINUTES_PER_DAY };
}

/** A drawn range from two pointer positions, in either direction, at least one snap step long. */
export function rangeBetween(anchor: number, current: number, limit = MINUTES_PER_DAY) {
	const start = Math.min(anchor, current);
	const end = Math.max(anchor, current);
	if (end - start >= SNAP_MINUTES) return { start, end };
	return start + SNAP_MINUTES > limit
		? { start: limit - SNAP_MINUTES, end: limit }
		: { start, end: start + SNAP_MINUTES };
}

/** Moves a range keeping its length, inside the displayed days. */
export function moveRange(start: number, end: number, to: number, limit = MINUTES_PER_DAY) {
	const length = end - start;
	const from = clamp(to, 0, limit - length);
	return { start: from, end: from + length };
}

/** Resizing keeps at least one snap step and at most a full day. */
export const resizeEnd = (start: number, pointer: number, limit: number) =>
	clamp(pointer, start + SNAP_MINUTES, Math.min(start + MINUTES_PER_DAY, limit));

export const resizeStart = (end: number, pointer: number) =>
	clamp(pointer, Math.max(0, end - MINUTES_PER_DAY), end - SNAP_MINUTES);

/** The one-hour slot around a tapped minute (touch creation). */
export function hourAt(minutes: number) {
	const start = clamp(Math.floor(minutes / 60) * 60, 0, MINUTES_PER_DAY - 60);
	return { start, end: start + 60 };
}
