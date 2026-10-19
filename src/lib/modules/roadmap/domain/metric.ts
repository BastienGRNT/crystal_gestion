import { isDateKey, startOfWeek, type DateKey } from '../../kernel/domain/dates';
import { ensure } from '../../kernel/domain/errors';

/** The value of the project's one number for a week. One per week: typing it again replaces it. */
export interface MetricReading {
	/** `projectId:weekOf`, so a second entry for the same week is the same row. */
	id: string;
	projectId: string;
	/** The Monday of the week. */
	weekOf: DateKey;
	value: number;
	by: string;
	at: string;
}

export const readingId = (projectId: string, weekOf: DateKey) => `${projectId}:${weekOf}`;

export function validWeekOf(day: string): DateKey {
	ensure(isDateKey(day), 'Semaine invalide.');
	return startOfWeek(day);
}

export function validMetricValue(value: number): number {
	ensure(Number.isFinite(value) && Math.abs(value) < 1e12, 'Valeur invalide.');
	return value;
}

/** Tracking starts with the first reading: before that, nobody is asked anything. */
export const tracking = (readings: MetricReading[]) => readings.length > 0;

export const latestReadings = (readings: MetricReading[]) =>
	[...readings].sort((a, b) => b.weekOf.localeCompare(a.weekOf));
