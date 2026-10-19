import { addDays, startOfWeek, toDateKey, type DateKey } from '$lib/modules/kernel/domain/dates';
import {
	activeMetrics,
	latestReadings,
	type Metric,
	type MetricReading
} from '$lib/modules/roadmap/domain/metric';
import { TASK_KINDS, type Task, type TaskKind } from '$lib/modules/tasks/domain/task';

const DAY_MS = 86_400_000;
const WINDOW_DAYS = 28;
/** Below that, a median or a pace says nothing yet. */
const MIN_SAMPLES = 3;

// ——— The project's own numbers, typed once a week ———

export interface MetricView {
	metric: Metric;
	/** Oldest first, one per week, at most `weeks`. */
	series: { weekOf: DateKey; value: number }[];
	last: number | null;
	/** Change since the reading before, `null` with less than two readings. */
	delta: number | null;
	/** The change goes the right way (up for clients, down for churn). */
	good: boolean | null;
	thisWeek: number | null;
}

export function metricViews(
	metrics: Metric[],
	readings: MetricReading[],
	today: DateKey,
	weeks = 12
): MetricView[] {
	const monday = startOfWeek(today);
	return activeMetrics(metrics).map((metric) => {
		const own = latestReadings(readings.filter((r) => r.metricId === metric.id));
		const [last, previous] = own;
		const delta = last && previous ? Math.round((last.value - previous.value) * 100) / 100 : null;
		return {
			metric,
			series: own
				.slice(0, weeks)
				.reverse()
				.map((r) => ({ weekOf: r.weekOf, value: r.value })),
			last: last?.value ?? null,
			delta,
			good: delta === null || delta === 0 ? null : delta > 0 === (metric.direction === 'up'),
			thisWeek: own.find((r) => r.weekOf === monday)?.value ?? null
		};
	});
}

/** Numbers already followed (one reading at least) that still miss this week's value. */
export function missingThisWeek(metrics: Metric[], readings: MetricReading[], today: DateKey) {
	const monday = startOfWeek(today);
	return activeMetrics(metrics).filter((m) => {
		const own = readings.filter((r) => r.metricId === m.id);
		return own.length > 0 && !own.some((r) => r.weekOf === monday);
	});
}

// ——— The team's numbers, computed from the tasks: nobody types them ———

const median = (values: number[], min = MIN_SAMPLES) => {
	if (!values.length || values.length < min) return null;
	const sorted = [...values].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

const days = (from: string, to: string) => (Date.parse(to) - Date.parse(from)) / DAY_MS;

const finishedSince = (tasks: Task[], since: number) =>
	tasks.filter((t) => t.status === 'done' && Date.parse(t.completedAt ?? '') >= since);

export interface WeekCount {
	weekOf: DateKey;
	byKind: Record<TaskKind, number>;
	total: number;
}

export interface TeamRhythm {
	/** Finished per week, the last `weeks` weeks, oldest first, split by kind. */
	weeks: WeekCount[];
	/** Average finished per week over four weeks, and over the four before. */
	perWeek: number;
	perWeekBefore: number;
	/** Median days from "started" to "done" over four weeks, by kind; `null` when too few. */
	cycleDays: Record<TaskKind, number | null>;
	/** Bugs still open, the blocking ones, the oldest's age in days. */
	openBugs: number;
	criticalBugs: number;
	oldestBugDays: number | null;
	/** Bugs reported and fixed this week. */
	bugsIn: number;
	bugsOut: number;
	/** Median hours to fix a blocking bug, over four weeks. */
	criticalFixHours: number | null;
	/** Share of the finished work by kind over four weeks (0..1). */
	share: Record<TaskKind, number>;
	/** In review for more than a day. */
	waitingReview: number;
	/** Finished on time among those with a deadline, over four weeks (0..1); `null` when too few. */
	onTime: number | null;
}

const zero = (): Record<TaskKind, number> => ({ feature: 0, bug: 0, tech: 0, action: 0 });

export function teamRhythm(tasks: Task[], now: Date, weeks = 8): TeamRhythm {
	const today = toDateKey(now);
	const t = now.getTime();
	const window = t - WINDOW_DAYS * DAY_MS;
	const recent = finishedSince(tasks, window);
	const before = finishedSince(tasks, window - WINDOW_DAYS * DAY_MS).filter(
		(task) => Date.parse(task.completedAt!) < window
	);

	const monday = startOfWeek(today);
	const counts: WeekCount[] = Array.from({ length: weeks }, (_, i) => {
		const weekOf = addDays(monday, -7 * (weeks - 1 - i));
		const end = addDays(weekOf, 7);
		const byKind = zero();
		for (const task of tasks) {
			const done =
				task.status === 'done' && task.completedAt ? toDateKey(new Date(task.completedAt)) : null;
			if (done && done >= weekOf && done < end) byKind[task.kind]++;
		}
		return { weekOf, byKind, total: TASK_KINDS.reduce((sum, k) => sum + byKind[k], 0) };
	});

	const cycleDays = zero() as Record<TaskKind, number | null>;
	for (const kind of TASK_KINDS)
		cycleDays[kind] = median(
			recent
				.filter((task) => task.kind === kind && task.startedAt)
				.map((task) => days(task.startedAt!, task.completedAt!))
		);

	const bugs = tasks.filter((task) => task.kind === 'bug');
	const open = bugs.filter((task) => ['todo', 'doing', 'review'].includes(task.status));
	const weekStart = Date.parse(`${monday}T00:00:00`);
	const fixHours = recent
		.filter((task) => task.kind === 'bug' && task.critical)
		.map((task) => days(task.createdAt, task.completedAt!) * 24);

	const share = zero();
	for (const task of recent) share[task.kind]++;
	for (const kind of TASK_KINDS) share[kind] = recent.length ? share[kind] / recent.length : 0;

	const withDeadline = recent.filter((task) => task.dueDate);
	const onTime = withDeadline.filter(
		(task) => toDateKey(new Date(task.completedAt!)) <= task.dueDate!
	).length;

	return {
		weeks: counts,
		perWeek: recent.length / (WINDOW_DAYS / 7),
		perWeekBefore: before.length / (WINDOW_DAYS / 7),
		cycleDays,
		openBugs: open.length,
		criticalBugs: open.filter((task) => task.critical).length,
		oldestBugDays: open.length
			? Math.floor(Math.max(...open.map((task) => days(task.createdAt, now.toISOString()))))
			: null,
		bugsIn: bugs.filter((task) => Date.parse(task.createdAt) >= weekStart).length,
		bugsOut: bugs.filter(
			(task) => task.status === 'done' && Date.parse(task.completedAt ?? '') >= weekStart
		).length,
		// Blocking bugs are rare: each one tells something.
		criticalFixHours: median(fixHours, 1),
		share,
		waitingReview: tasks.filter(
			(task) => task.status === 'review' && t - Date.parse(task.statusChangedAt) > DAY_MS
		).length,
		onTime: withDeadline.length >= MIN_SAMPLES ? onTime / withDeadline.length : null
	};
}
