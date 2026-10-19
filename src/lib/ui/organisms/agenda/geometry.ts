import { clamp } from '$lib/modules/planning/domain/calendar';
import { columnAt, minutesToPx, pxToMinutes } from '$lib/modules/planning/domain/grid';
import type { AgendaDraft, AgendaItem, GridFrame } from './types';

/** What a task row carries when dragged onto the grid. */
export const TASK_DRAG_TYPE = 'text/x-crystal-task';

/** Short items keep a grabbable, readable height. */
const MIN_HEIGHT_PX = 20;

/** Work blocks leave a strip of the lane free so the availability underneath stays visible. */
const BLOCK_INSET = 0.16;

type Box = Pick<AgendaItem, 'layer' | 'lane' | 'start' | 'end'> &
	Partial<Pick<AgendaItem, 'column' | 'columns'>>;

/** Pixels from the top of the visible slice of the day. */
export const topOf = (minutes: number, { hourHeight, from }: GridFrame) =>
	minutesToPx(minutes - from, { hourHeight });

export function boxStyle(box: Box | AgendaDraft, lanes: number, frame: GridFrame) {
	const { hourHeight } = frame;
	const { column = 0, columns = 1 } = box as Box;
	const lane = 100 / lanes;
	const inset = box.layer === 'block' ? lane * BLOCK_INSET : 0;
	const width = (lane - inset) / columns;
	const left = box.lane * lane + inset + column * width;
	const top = topOf(box.start, frame);
	const height = Math.max(MIN_HEIGHT_PX, minutesToPx(box.end - box.start, { hourHeight }));
	return `top:${top}px;height:${height}px;left:calc(${left}% + 1px);width:calc(${width}% - 3px)`;
}

/** The item color as a CSS variable, so faces can mix it with transparency. */
export const tint = (color: string | null) => `--tint:${color ?? 'var(--accent)'}`;

/** "Peut-être" is hatched; a week carried over keeps its fill but a dotted edge: not said yet. */
export function availabilityFill(maybe: boolean, carried = false) {
	if (maybe)
		return 'background:repeating-linear-gradient(135deg,color-mix(in oklab,var(--tint) 26%,transparent) 0 2px,color-mix(in oklab,var(--tint) 6%,transparent) 2px 7px);border:1px dashed color-mix(in oklab,var(--tint) 55%,transparent)';
	return carried
		? 'background:color-mix(in oklab,var(--tint) 12%,transparent);border:1.5px dotted color-mix(in oklab,var(--tint) 70%,transparent)'
		: 'background:color-mix(in oklab,var(--tint) 16%,transparent);border-left:2px solid color-mix(in oklab,var(--tint) 75%,transparent)';
}

/** Day column and (unsnapped) minute under the pointer, scroll included, kept inside the slice. */
export function pointerAt(surface: HTMLElement, event: MouseEvent, days: number, frame: GridFrame) {
	const rect = surface.getBoundingClientRect();
	const day = columnAt(event.clientX - rect.left, rect.width, days);
	const minutes = frame.from + pxToMinutes(event.clientY - rect.top, frame);
	return { day, minutes: clamp(minutes, frame.from, frame.to) };
}

/** Hours shown on an item; "…" marks the side cut at midnight (the item goes on the other day). */
export const rangeLabel = (
	item: Pick<AgendaItem, 'start' | 'end' | 'clippedStart' | 'clippedEnd'>,
	clock: (m: number) => string
) => `${item.clippedStart ? '…' : clock(item.start)}–${item.clippedEnd ? '…' : clock(item.end)}`;

/** The item under a mouse pointer, for the hover card (none while dragging or on touch). */
export function hoverAt(event: PointerEvent, items: AgendaItem[], dragging: boolean) {
	const target = (event.target as HTMLElement).closest('[data-agenda-item]');
	const id = target?.getAttribute('data-agenda-item');
	const item =
		!dragging && event.pointerType !== 'touch' ? items.find((i) => i.id === id) : undefined;
	return item ? { item, x: event.clientX, y: event.clientY } : null;
}
