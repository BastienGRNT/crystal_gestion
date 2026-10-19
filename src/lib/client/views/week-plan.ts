import { toDateKey, type DateKey } from '$lib/modules/kernel/domain/dates';
import type { AvailabilitySlot, WorkBlock } from '$lib/modules/planning/domain/availability';
import type { Milestone } from '$lib/modules/roadmap/domain/milestone';
import type { Task } from '$lib/modules/tasks/domain/task';

export interface Range {
	startsAt: string;
	endsAt: string;
}

/** The days shown, from the first midnight (included) to the last one (excluded). */
export interface Week {
	from: Date;
	to: Date;
}

/** "Poser" books 2 h at most: a task rarely fits in one sitting, the rest stays open to others. */
export const MAX_PLACE_MINUTES = 120;
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
	byProject: { projectId: string; minutes: number }[];
}

export function personWeek(
	userId: string,
	slots: AvailabilitySlot[],
	blocks: WorkBlock[],
	week: Week
): PersonWeek {
	const window = windowOf(week);
	const sure = merge(clipped(sureOf(userId, slots), window));
	const own = blocks.filter((b) => b.userId === userId);
	const busy = merge(clipped(own, window));
	const byProject = [...Map.groupBy(own, (b) => b.projectId)]
		.map(([projectId, list]) => ({ projectId, minutes: total(merge(clipped(list, window))) }))
		.filter((p) => p.minutes > 0)
		.sort((a, b) => b.minutes - a.minutes);
	return {
		available: total(sure),
		planned: total(busy),
		free: total(subtract(sure, busy)),
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

/**
 * The tasks one after the other in the free time, in order, at most `max` minutes each, starting
 * on a quarter hour. Crumbs too short for a task are skipped; tasks that do not fit are left out.
 */
export function placeTasks(taskIds: string[], free: Range[], max = MAX_PLACE_MINUTES): Placement[] {
	const spans = free.map(spanOf).sort((a, b) => a.start - b.start);
	const placements: Placement[] = [];
	for (const taskId of taskIds) {
		const span = spans.find(
			(s) => s.end - Math.ceil(s.start / QUARTER) * QUARTER >= MIN_PLACE_MINUTES * MINUTE
		);
		if (!span) break;
		const start = Math.ceil(span.start / QUARTER) * QUARTER;
		const end = Math.min(span.end, start + max * MINUTE);
		placements.push({ taskId, ...rangeOf({ start, end }) });
		span.start = end;
	}
	return placements;
}

/**
 * A task dropped at a precise time: up to `max` minutes, stopping before the person's next block.
 * Null when the drop lands on one of their blocks.
 */
export function placeAt(
	userId: string,
	blocks: WorkBlock[],
	start: Date,
	max = MAX_PLACE_MINUTES
): Range | null {
	const at = start.getTime();
	const own = blocks.filter((b) => b.userId === userId).map(spanOf);
	if (own.some((b) => b.start <= at && at < b.end)) return null;
	const next = Math.min(...own.filter((b) => b.start > at).map((b) => b.start));
	return rangeOf({ start: at, end: Math.min(at + max * MINUTE, next) });
}

export interface PlaceContext {
	meId: string;
	projectId: string;
	/** Every block: a task planned by anyone this week is already placed. */
	blocks: WorkBlock[];
	week: Week;
	currentStepId: string | null;
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

/** My open tasks of the project (mine or nobody's) that no block of the week covers yet. */
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
				(t.assigneeId === ctx.meId || t.assigneeId === null) &&
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

/** The agenda shows 7 h–21 h, widened only to show what lies outside (minutes of the day). */
export function hourWindow(items: { start: number; end: number }[], from = 7, to = 21) {
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
