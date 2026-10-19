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
	/** Work on another project: shown so the time reads as taken, but changed over there. */
	muted: boolean;
	/** Availability reused from an earlier week, not stored yet. */
	carried: boolean;
	/** What a narrow column still has room for: "#12", or the project's initials. */
	short: string;
	column: number;
	columns: number;
	/** Full details for the hover card: blocks are often too small to show them. */
	info: { title: string; lines: string[] };
}

export interface AgendaLane {
	id: string;
	name: string;
	/** CSS color of the person (their tint). */
	color: string;
	/** Their avatar color index. */
	colorIndex: number;
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

/** The visible slice of the day: pixels per hour and the minutes at the top and bottom. */
export interface GridFrame {
	hourHeight: number;
	from: number;
	to: number;
}

export type Point = { x: number; y: number };

export interface AgendaHandlers {
	/** A range drawn (or tapped, an hour long) on the grid; `point` is where the pointer let go. */
	oncreate: (day: number, start: number, end: number, point: Point) => void;
	/** Shifts, in minutes, applied to the item's real start and end. */
	onchange: (item: AgendaItem, startShift: number, endShift: number) => void;
	onselect: (item: AgendaItem, point: Point) => void;
}

/** A column header of the agenda, already formatted by the caller. */
export interface DayMark {
	id: string;
	ref: string;
	/** `due`: a task planned to end that day; `step`: the end of a step; `release`: shipped; `done`: finished. */
	kind: 'due' | 'step' | 'release' | 'done';
	title: string;
	color: string;
	late: boolean;
	person?: { name: string; colorIndex: number };
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
	/** A drawn range waiting for the person to say what it is. */
	held?: AgendaDraft | null;
	now: { day: number; minutes: number } | null;
	/** Lane where new items are drawn: the current user's. */
	myLane: number;
	hourHeight?: number;
	fromHour?: number;
	toHour?: number;
	/** Opens what a mark above a day points to. */
	onmark?: (mark: DayMark) => void;
	/** A task dragged from outside and dropped at that minute of that day. */
	ondroptask?: (day: number, minutes: number, taskId: string) => void;
}
