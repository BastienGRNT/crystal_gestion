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

/** A drawn range from two pointer positions, in either direction, at least one snap step long. */
export function rangeBetween(anchor: number, current: number) {
	const start = Math.min(anchor, current);
	const end = Math.max(anchor, current);
	if (end - start >= SNAP_MINUTES) return { start, end };
	return start + SNAP_MINUTES > MINUTES_PER_DAY
		? { start: MINUTES_PER_DAY - SNAP_MINUTES, end: MINUTES_PER_DAY }
		: { start, end: start + SNAP_MINUTES };
}

/** Moves a range keeping its length, without leaving the day. */
export function moveRange(start: number, end: number, to: number) {
	const length = end - start;
	const from = clamp(to, 0, MINUTES_PER_DAY - length);
	return { start: from, end: from + length };
}

/** The one-hour slot around a tapped minute (touch creation). */
export function hourAt(minutes: number) {
	const start = clamp(Math.floor(minutes / 60) * 60, 0, MINUTES_PER_DAY - 60);
	return { start, end: start + 60 };
}
