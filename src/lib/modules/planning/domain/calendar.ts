export const MINUTES_PER_DAY = 24 * 60;
export const SNAP_MINUTES = 15;

export const startOfDay = (date: Date) =>
	new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** Calendar arithmetic (not 24 h steps) so days stay aligned across daylight saving changes. */
export const addDays = (date: Date, days: number) =>
	new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

/** Monday of the week containing `date`. */
export const startOfWeek = (date: Date) => addDays(date, -((date.getDay() + 6) % 7));

export const weekDays = (date: Date) =>
	Array.from({ length: 7 }, (_, index) => addDays(startOfWeek(date), index));

export const sameDay = (a: Date, b: Date) => startOfDay(a).getTime() === startOfDay(b).getTime();

export const dayKey = (date: Date) =>
	`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

/** Minutes elapsed since the local midnight of `day` (negative before, > 1440 after). */
export const minutesFrom = (day: Date, at: Date | string) =>
	Math.round((new Date(at).getTime() - startOfDay(day).getTime()) / 60_000);

export const atMinutes = (day: Date, minutes: number) =>
	new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, minutes);

export const clamp = (value: number, min: number, max: number) =>
	Math.min(max, Math.max(min, value));

export const snap = (minutes: number, step = SNAP_MINUTES) => Math.round(minutes / step) * step;

export const shiftIso = (iso: string, minutes: number) =>
	new Date(Date.parse(iso) + minutes * 60_000).toISOString();

/** "9:00", "14:30" — compact French clock time. */
export const clockLabel = (minutes: number) =>
	`${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`;

/** The part of a range falling on `day`, in minutes of that day, or null when it misses it. */
export function daySegment(day: Date, start: Date | string, end: Date | string) {
	const from = minutesFrom(day, start);
	const to = minutesFrom(day, end);
	if (to <= 0 || from >= MINUTES_PER_DAY) return null;
	return {
		start: Math.max(0, from),
		end: Math.min(MINUTES_PER_DAY, to),
		clippedStart: from < 0,
		clippedEnd: to > MINUTES_PER_DAY
	};
}

/** Inverse of `dayKey`; null for anything that is not a valid YYYY-MM-DD. */
export function parseDayKey(key: string | null): Date | null {
	const match = key?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (!match) return null;
	const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
	return dayKey(date) === key ? date : null;
}
