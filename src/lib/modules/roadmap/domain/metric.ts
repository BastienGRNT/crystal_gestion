import { isDateKey, startOfWeek, type DateKey } from '../../kernel/domain/dates';
import { ensure, requiredText } from '../../kernel/domain/errors';

/**
 * A number the project lives by (paying clients, MRR, appointments taken…), noted once a week.
 * The team's own numbers (pace, cycle time, open bugs) are computed, never typed.
 */
export interface Metric {
	id: string;
	projectId: string;
	name: string;
	/** `€`, `%`, `h`… or nothing. */
	unit: string;
	target: number | null;
	/** Whether going up is good news (clients) or bad news (churn, open tickets). */
	direction: 'up' | 'down';
	position: number;
	archivedAt: string | null;
	createdAt: string;
}

export const DIRECTIONS = ['up', 'down'] as const;

/** Beyond five, nobody notes them any more. */
export const MAX_METRICS = 5;

/** The value of one number for a week. One per week: typing it again replaces it. */
export interface MetricReading {
	/** `metricId:weekOf`, so a second entry for the same week is the same row. */
	id: string;
	metricId: string;
	projectId: string;
	/** The Monday of the week. */
	weekOf: DateKey;
	value: number;
	by: string;
	at: string;
}

export const readingId = (metricId: string, weekOf: DateKey) => `${metricId}:${weekOf}`;

export const validMetricName = (name: string) => requiredText(name, 'Le nom du chiffre', 60);

export function validUnit(unit: string): string {
	ensure(unit.trim().length <= 12, 'L’unité est trop longue (12 caractères maximum).');
	return unit.trim();
}

export function validTarget(target: number | null): number | null {
	ensure(
		target === null || (Number.isFinite(target) && Math.abs(target) < 1e12),
		'Cible invalide.'
	);
	return target;
}

export function ensureRoomForMetric(existing: Metric[]) {
	ensure(
		existing.filter((m) => !m.archivedAt).length < MAX_METRICS,
		`${MAX_METRICS} chiffres suffisent : retires-en un d’abord.`
	);
}

export function validWeekOf(day: string): DateKey {
	ensure(isDateKey(day), 'Semaine invalide.');
	return startOfWeek(day);
}

export function validMetricValue(value: number): number {
	ensure(Number.isFinite(value) && Math.abs(value) < 1e12, 'Valeur invalide.');
	return value;
}

export const activeMetrics = (metrics: Metric[]) =>
	metrics.filter((m) => !m.archivedAt).sort((a, b) => a.position - b.position);

/** Tracking starts with the first reading: before that, nobody is asked anything. */
export const tracking = (readings: MetricReading[]) => readings.length > 0;

export const latestReadings = (readings: MetricReading[]) =>
	[...readings].sort((a, b) => b.weekOf.localeCompare(a.weekOf));

/**
 * "Clients payants : 42 / 50" from a number like "clients payants 50": a number at the end is
 * the target, so adding one is a single line.
 */
export function parseMetricLine(text: string): {
	name: string;
	target: number | null;
	unit: string;
} {
	const match = text.trim().match(/^(.*?)\s+(\d[\d\s\u202f]*(?:[.,]\d+)?)\s*(€|%|h|k€)?$/);
	if (!match || !match[1].trim()) return { name: text.trim(), target: null, unit: '' };
	const target = Number(match[2].replace(/[\s\u202f]/g, '').replace(',', '.'));
	return { name: match[1].trim(), target, unit: match[3] ?? '' };
}
