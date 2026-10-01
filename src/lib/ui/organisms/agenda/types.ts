export type AgendaLayer = 'availability' | 'block';
export type AgendaScale = 'week' | 'day';
export type AgendaAudience = 'me' | 'team';
export type DragMode = 'create' | 'move' | 'start' | 'end';

/** One item (or the part of it falling on one day) as the grid draws it; times in minutes of the day. */
export interface AgendaItem {
	id: string;
	layer: AgendaLayer;
	day: number;
	lane: number;
	start: number;
	end: number;
	clippedStart: boolean;
	clippedEnd: boolean;
	/** Member color in the team view; null uses the personal palette (tokens). */
	color: string | null;
	maybe: boolean;
	running: boolean;
	label: string;
	ref: string | null;
	editable: boolean;
	column: number;
	columns: number;
	/** Full details for the hover card: blocks are often too small to show them. */
	info: { title: string; lines: string[] };
}

export interface AgendaLane {
	id: string;
	name: string;
	color: string;
}

/** A moment when at least two people are available together. */
export interface SharedBand {
	day: number;
	start: number;
	end: number;
	names: string[];
}

export interface AgendaDraft {
	id: string | null;
	layer: AgendaLayer;
	day: number;
	lane: number;
	start: number;
	end: number;
}

export interface AgendaHandlers {
	oncreate: (day: number, start: number, end: number, tap: boolean) => void;
	/** Shifts, in minutes, applied to the item's real start and end. */
	onchange: (item: AgendaItem, startShift: number, endShift: number) => void;
	onselect: (item: AgendaItem, point: { x: number; y: number }) => void;
}

/** A column header of the agenda, already formatted by the caller. */
export interface DayMark {
	id: string;
	ref: string;
	/** `due`: planned to end that day; `done`: finished that day. */
	kind: 'due' | 'done';
	title: string;
	color: string;
	late: boolean;
	person?: { name: string; color: string };
}

export interface AgendaDay {
	key: string;
	weekday: string;
	date: string;
	today: boolean;
	marks: DayMark[];
}

export interface AgendaGridProps extends AgendaHandlers {
	days: AgendaDay[];
	lanes: AgendaLane[];
	items: AgendaItem[];
	bands: SharedBand[];
	/** The layer that is interactive and that drawing creates. */
	layer: AgendaLayer;
	now: { day: number; minutes: number } | null;
	/** Lane where new items are drawn: the current user's. */
	myLane: number;
	hourHeight?: number;
	/** Opens a due or finished task shown above a day. */
	onmark?: (ref: string) => void;
}
