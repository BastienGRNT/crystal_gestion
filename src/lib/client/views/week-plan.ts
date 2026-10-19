import { toDateKey, type DateKey } from '$lib/modules/kernel/domain/dates';
import {
	copiedWeek,
	type AvailabilitySlot,
	type WorkBlock
} from '$lib/modules/planning/domain/availability';
import { addDays } from '$lib/modules/planning/domain/calendar';
import type { Milestone } from '$lib/modules/roadmap/domain/milestone';
import type { Task, TaskKind } from '$lib/modules/tasks/domain/task';

export interface Range {
	startsAt: string;
	endsAt: string;
}

/** The days shown, from the first midnight (included) to the last one (excluded). */
export interface Week {
	from: Date;
	to: Date;
}

/**
 * How long a task takes when nobody said so, from its kind alone: no estimate is ever asked.
 * A call is quick, a fix takes an hour, technical work a half-day, a feature a bit more.
 */
export const DEFAULT_MINUTES: Record<TaskKind, number> = {
	action: 30,
	bug: 60,
	tech: 180,
	feature: 240
};
/** Shorter leftovers are not worth starting a task in. */
export const MIN_PLACE_MINUTES = 30;

const MINUTE = 60_000;
const QUARTER = 15 * MINUTE;

type Span = { start: number; end: number };

const spanOf = (range: Range): Span => ({
	start: Date.parse(range.startsAt),
	end: Date.parse(range.endsAt)
});
const rangeOf = (span: Span): Range => ({
	startsAt: new Date(span.start).toISOString(),
	endsAt: new Date(span.end).toISOString()
});
const windowOf = (week: Week): Span => ({ start: week.from.getTime(), end: week.to.getTime() });

function clip(span: Span, window: Span): Span | null {
	const start = Math.max(span.start, window.start);
	const end = Math.min(span.end, window.end);
	return end > start ? { start, end } : null;
}

/** Sorted, with overlapping or touching spans joined. */
function merge(spans: Span[]): Span[] {
	const sorted = [...spans].sort((a, b) => a.start - b.start);
	const merged: Span[] = [];
	for (const span of sorted) {
		const last = merged.at(-1);
		if (last && span.start <= last.end) last.end = Math.max(last.end, span.end);
		else merged.push({ ...span });
	}
	return merged;
}

function subtract(spans: Span[], holes: Span[]): Span[] {
	return spans.flatMap((span) => {
		let parts = [span];
		for (const hole of holes)
			parts = parts.flatMap((part) =>
				hole.end <= part.start || hole.start >= part.end
					? [part]
					: [
							{ start: part.start, end: hole.start },
							{ start: hole.end, end: part.end }
						].filter((p) => p.end > p.start)
			);
		return parts;
	});
}

const total = (spans: Span[]) => spans.reduce((sum, s) => sum + (s.end - s.start) / MINUTE, 0);

const clipped = (ranges: Range[], window: Span) =>
	ranges.flatMap((range) => clip(spanOf(range), window) ?? []);

/** Sure availability only: a "peut-être" is not time anyone can count on. */
const sureOf = (userId: string, slots: AvailabilitySlot[]) =>
	slots.filter((s) => s.userId === userId && s.status === 'available');

export interface PersonWeek {
	/** Minutes surely available. */
	available: number;
	/** Minutes of work planned, every project included. */
	planned: number;
	/** Available minutes no block takes yet. */
	free: number;
	/** The free minutes still ahead of `now`: what can still be used this week. */
	ahead: number;
	byProject: { projectId: string; minutes: number }[];
}

export function personWeek(
	userId: string,
	slots: AvailabilitySlot[],
	blocks: WorkBlock[],
	week: Week,
	now: Date = week.from
): PersonWeek {
	const window = windowOf(week);
	const sure = merge(clipped(sureOf(userId, slots), window));
	const own = blocks.filter((b) => b.userId === userId);
	const busy = merge(clipped(own, window));
	const byProject = [...Map.groupBy(own, (b) => b.projectId)]
		.map(([projectId, list]) => ({ projectId, minutes: total(merge(clipped(list, window))) }))
		.filter((p) => p.minutes > 0)
		.sort((a, b) => b.minutes - a.minutes);
	const free = subtract(sure, busy);
	const later = { start: Math.max(window.start, now.getTime()), end: window.end };
	return {
		available: total(sure),
		planned: total(busy),
		free: total(free),
		ahead: total(free.flatMap((span) => clip(span, later) ?? [])),
		byProject
	};
}

/** Someone's sure availability between two instants that no block (of any project) takes yet. */
export function freeRanges(
	userId: string,
	slots: AvailabilitySlot[],
	blocks: WorkBlock[],
	from: Date,
	to: Date
): Range[] {
	const window = { start: from.getTime(), end: to.getTime() };
	if (window.end <= window.start) return [];
	const sure = merge(clipped(sureOf(userId, slots), window));
	const busy = merge(
		clipped(
			blocks.filter((b) => b.userId === userId),
			window
		)
	);
	return subtract(sure, busy).map(rangeOf);
}

export interface Placement extends Range {
	taskId: string;
}

const quarterUp = (ms: number) => Math.ceil(ms / QUARTER) * QUARTER;

/**
 * The tasks one after the other in the free time, in order, each for its default length: the
 * next free span first, then the following ones until the length is covered (several blocks for
 * one task). Starts on a quarter hour; crumbs under 30 min are skipped unless they finish a task.
 * A task the week cannot hold keeps what fitted.
 */
export function placeTasks(tasks: Pick<Task, 'id' | 'kind'>[], free: Range[]): Placement[] {
	const spans = free.map(spanOf).sort((a, b) => a.start - b.start);
	const placements: Placement[] = [];
	for (const task of tasks) {
		let left = DEFAULT_MINUTES[task.kind] * MINUTE;
		for (const span of spans) {
			if (left <= 0) break;
			const start = quarterUp(span.start);
			const room = span.end - start;
			if (room <= 0 || room < Math.min(MIN_PLACE_MINUTES * MINUTE, left)) continue;
			const end = start + Math.min(room, left);
			placements.push({ taskId: task.id, ...rangeOf({ start, end }) });
			left -= end - start;
			span.start = end;
		}
	}
	return placements;
}

/**
 * A task dropped at a precise time: for `minutes`, stopping before the person's next block.
 * Null when the drop lands on one of their blocks.
 */
export function placeAt(
	userId: string,
	blocks: WorkBlock[],
	start: Date,
	minutes: number
): Range | null {
	const at = start.getTime();
	const own = blocks.filter((b) => b.userId === userId).map(spanOf);
	if (own.some((b) => b.start <= at && at < b.end)) return null;
	const next = Math.min(...own.filter((b) => b.start > at).map((b) => b.start));
	return rangeOf({ start: at, end: Math.min(at + minutes * MINUTE, next) });
}

/** The default length of these tasks, added up. */
export const workMinutes = (tasks: Pick<Task, 'kind'>[]) =>
	tasks.reduce((sum, t) => sum + DEFAULT_MINUTES[t.kind], 0);

export interface PlaceContext {
	meId: string;
	projectId: string;
	/** Every block: a task planned by anyone this week is already placed. */
	blocks: WorkBlock[];
	week: Week;
	currentStepId: string | null;
	/** Whether tasks nobody holds count as mine (yes for me, no when sizing a teammate's week). */
	unassigned?: boolean;
}

/** Lower comes first: blocking bugs, deadlines, work under way, the matrix, the step under way. */
function urgency(task: Task, lastDay: DateKey, currentStepId: string | null): number {
	if (task.critical) return 0;
	if (task.dueDate && task.dueDate <= lastDay) return 1;
	if (task.status === 'doing') return 2;
	if (task.quadrant === 'now') return 3;
	if (currentStepId && task.milestoneId === currentStepId) return 4;
	// A task of a later step waits its turn.
	return task.milestoneId ? 6 : 5;
}

/** Someone's open tasks of the project (theirs, or nobody's) that no block of the week covers yet. */
export function tasksToPlace(tasks: Task[], ctx: PlaceContext): Task[] {
	const window = windowOf(ctx.week);
	const placed = new Set(
		ctx.blocks.filter((b) => b.taskId && clip(spanOf(b), window)).map((b) => b.taskId)
	);
	const lastDay = toDateKey(new Date(ctx.week.to.getTime() - 1));
	const rank = (t: Task) => urgency(t, lastDay, ctx.currentStepId);
	return tasks
		.filter(
			(t) =>
				t.projectId === ctx.projectId &&
				(t.status === 'todo' || t.status === 'doing') &&
				!t.blockedReason &&
				(t.assigneeId === ctx.meId || (t.assigneeId === null && ctx.unassigned !== false)) &&
				!placed.has(t.id)
		)
		.sort(
			(a, b) =>
				rank(a) - rank(b) ||
				(a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999') ||
				a.position - b.position
		);
}

/** Someone's blocks touching the week, in time order. */
export const weekBlocks = (userId: string, blocks: WorkBlock[], week: Week) =>
	blocks
		.filter((b) => b.userId === userId && clip(spanOf(b), windowOf(week)))
		.sort((a, b) => a.startsAt.localeCompare(b.startsAt));

export const hasSlots = (userId: string, slots: AvailabilitySlot[], week: Week) =>
	slots.some((s) => s.userId === userId && clip(spanOf(s), windowOf(week)));

/** Ids of availability carried over from an earlier week: shown and counted, not stored. */
export const CARRIED = 'carried:';
export const isCarried = (id: string) => id.startsWith(CARRIED);
/** How far back a week without availability looks for one to reuse. */
export const CARRIED_WEEKS = 6;

export interface CarriedWeek {
	/** Monday of the week it comes from. */
	from: Date;
	slots: AvailabilitySlot[];
}

/**
 * A week where someone gave no availability reuses their last week that had some (six weeks
 * back at most), moved to this week at the same local hours. Most weeks look alike: nobody
 * should have to say it again.
 */
export function carriedWeek(
	userId: string,
	slots: AvailabilitySlot[],
	monday: Date,
	weeks = CARRIED_WEEKS
): CarriedWeek | null {
	const own = slots.filter((s) => s.userId === userId);
	if (hasSlots(userId, own, { from: monday, to: addDays(monday, 7) })) return null;
	for (let back = 1; back <= weeks; back++) {
		const from = addDays(monday, -7 * back);
		const copies = copiedWeek(own, from, monday);
		if (copies.length)
			return { from, slots: copies.map((s, i) => ({ ...s, id: `${CARRIED}${userId}:${i}` })) };
	}
	return null;
}

const dayMonth = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });

/** "reconduit de la semaine du 12 oct.". */
export const carriedLabel = (from: Date) => `reconduit de la semaine du ${dayMonth.format(from)}`;

/** Everyone's availability as the week reads it: what is stored, plus what is carried over. */
export function withCarried(slots: AvailabilitySlot[], userIds: string[], monday: Date) {
	const carried = new Map<string, CarriedWeek>();
	for (const userId of userIds) {
		const week = carriedWeek(userId, slots, monday);
		if (week) carried.set(userId, week);
	}
	return { slots: [...slots, ...[...carried.values()].flatMap((w) => w.slots)], carried };
}

/** A usual week to start from: Monday to Friday, 9 h–12 h and 14 h–18 h. */
export function typicalWeek(monday: Date): Range[] {
	const at = (day: number, hour: number) =>
		new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + day, hour).toISOString();
	return [0, 1, 2, 3, 4].flatMap((day) => [
		{ startsAt: at(day, 9), endsAt: at(day, 12) },
		{ startsAt: at(day, 14), endsAt: at(day, 18) }
	]);
}

export interface WeekDeadline {
	id: string;
	day: DateKey;
	kind: 'delivery' | 'step' | 'task';
	title: string;
	/** The task to open, for a task. */
	taskId: string | null;
	ref: string | null;
}

const KIND_ORDER = { delivery: 0, step: 1, task: 2 };

/** What has to be ready during these days: due tasks, ends of steps, the delivery. */
export function weekDeadlines(
	days: DateKey[],
	sources: { tasks: Task[]; milestones: Milestone[]; deadline: DateKey | null }
): WeekDeadline[] {
	const inWeek = (key: DateKey | null): key is DateKey => !!key && days.includes(key);
	const delivery: WeekDeadline[] = inWeek(sources.deadline)
		? [
				{
					id: 'delivery',
					day: sources.deadline,
					kind: 'delivery',
					title: 'Livraison du projet',
					taskId: null,
					ref: null
				}
			]
		: [];
	const steps: WeekDeadline[] = sources.milestones
		.filter((m) => !m.closedAt && inWeek(m.targetDate))
		.map((m) => ({
			id: `step-${m.id}`,
			day: m.targetDate!,
			kind: 'step',
			title: `Fin : ${m.title}`,
			taskId: null,
			ref: null
		}));
	const due: WeekDeadline[] = sources.tasks
		.filter((t) => t.status !== 'done' && t.status !== 'idea' && inWeek(t.dueDate))
		.map((t) => ({
			id: `task-${t.id}`,
			day: t.dueDate!,
			kind: 'task',
			title: t.title,
			taskId: t.id,
			ref: `#${t.number}`
		}));
	return [...delivery, ...steps, ...due].sort(
		(a, b) => a.day.localeCompare(b.day) || KIND_ORDER[a.kind] - KIND_ORDER[b.kind]
	);
}

/** The agenda shows 8 h–21 h at least, widened to the earliest and latest item (minutes of the day). */
export function hourWindow(items: { start: number; end: number }[], from = 8, to = 21) {
	if (!items.length) return { from, to };
	return {
		from: Math.min(from, Math.floor(Math.min(...items.map((i) => i.start)) / 60)),
		to: Math.max(to, Math.ceil(Math.max(...items.map((i) => i.end)) / 60))
	};
}

/** "18 h", "2 h 30", "45 min". */
export function hoursLabel(minutes: number) {
	const rounded = Math.round(minutes / 15) * 15;
	const hours = Math.floor(rounded / 60);
	const rest = rounded % 60;
	if (!hours) return rest ? `${rest} min` : '0 h';
	return rest ? `${hours} h ${String(rest).padStart(2, '0')}` : `${hours} h`;
}

/** "9 h", "14 h 30". */
export const hourLabel = (date: Date) =>
	date.getMinutes()
		? `${date.getHours()} h ${String(date.getMinutes()).padStart(2, '0')}`
		: `${date.getHours()} h`;

const weekday = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' });

/** "mar. 9 h–11 h". */
export function spanLabel(range: Range) {
	const [start, end] = [new Date(range.startsAt), new Date(range.endsAt)];
	return `${weekday.format(start)} ${hourLabel(start)}–${hourLabel(end)}`;
}
