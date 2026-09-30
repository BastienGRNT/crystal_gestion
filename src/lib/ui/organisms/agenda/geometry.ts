import { columnAt, minutesToPx, pxToMinutes } from '$lib/modules/planning/domain/grid';
import type { AgendaDraft, AgendaItem } from './types';

/** Short items keep a grabbable, readable height. */
const MIN_HEIGHT_PX = 20;

/** Work blocks leave a strip of the lane free so the availability underneath stays visible. */
const BLOCK_INSET = 0.16;

type Box = Pick<AgendaItem, 'layer' | 'lane' | 'start' | 'end'> &
	Partial<Pick<AgendaItem, 'column' | 'columns'>>;

export function boxStyle(box: Box | AgendaDraft, lanes: number, hourHeight: number) {
	const { column = 0, columns = 1 } = box as Box;
	const lane = 100 / lanes;
	const inset = box.layer === 'block' ? lane * BLOCK_INSET : 0;
	const width = (lane - inset) / columns;
	const left = box.lane * lane + inset + column * width;
	const top = minutesToPx(box.start, { hourHeight });
	const height = Math.max(MIN_HEIGHT_PX, minutesToPx(box.end - box.start, { hourHeight }));
	return `top:${top}px;height:${height}px;left:calc(${left}% + 1px);width:calc(${width}% - 3px)`;
}

/** The item color as a CSS variable, so faces can mix it with transparency. */
export const tint = (color: string | null) => `--tint:${color ?? 'var(--accent)'}`;

export const availabilityFill = (maybe: boolean) =>
	maybe
		? 'background:repeating-linear-gradient(135deg,color-mix(in oklab,var(--tint) 26%,transparent) 0 2px,color-mix(in oklab,var(--tint) 6%,transparent) 2px 7px);border:1px dashed color-mix(in oklab,var(--tint) 55%,transparent)'
		: 'background:color-mix(in oklab,var(--tint) 16%,transparent);border-left:2px solid color-mix(in oklab,var(--tint) 75%,transparent)';

/** Day column and (unsnapped) minute under the pointer, scroll included. */
export function pointerAt(
	surface: HTMLElement,
	event: PointerEvent,
	days: number,
	hourHeight: number
) {
	const rect = surface.getBoundingClientRect();
	const day = columnAt(event.clientX - rect.left, rect.width, days);
	return { day, minutes: pxToMinutes(event.clientY - rect.top, { hourHeight }) };
}

/** Hours shown on an item; "…" marks the side cut at midnight (the item goes on the other day). */
export const rangeLabel = (
	item: Pick<AgendaItem, 'start' | 'end' | 'clippedStart' | 'clippedEnd'>,
	clock: (m: number) => string
) => `${item.clippedStart ? '…' : clock(item.start)}–${item.clippedEnd ? '…' : clock(item.end)}`;
