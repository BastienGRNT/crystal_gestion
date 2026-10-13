/**
 * Calendar days as `YYYY-MM-DD` strings in local time. Deadlines and availability are wall-clock
 * dates for a small team in one timezone, so they never go through UTC conversions.
 */
export type DateKey = string;

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86_400_000;

/** Rejects impossible days like 2026-02-31 instead of letting them roll over. */
export const isDateKey = (value: string): value is DateKey =>
	DATE_KEY.test(value) && toDateKey(parseDateKey(value)) === value;

export function toDateKey(date: Date): DateKey {
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseDateKey(key: DateKey): Date {
	const [year, month, day] = key.split('-').map(Number);
	return new Date(year, month - 1, day);
}

export function addDays(key: DateKey, days: number): DateKey {
	const date = parseDateKey(key);
	date.setDate(date.getDate() + days);
	return toDateKey(date);
}

/** Days from `from` to `to` (negative when `to` is earlier). */
export function daysBetween(from: DateKey, to: DateKey): number {
	return Math.round((parseDateKey(to).getTime() - parseDateKey(from).getTime()) / DAY_MS);
}

/** Monday = 0 … Sunday = 6, the way a French week reads. */
export function weekdayOf(key: DateKey): number {
	return (parseDateKey(key).getDay() + 6) % 7;
}

export const startOfWeek = (key: DateKey): DateKey => addDays(key, -weekdayOf(key));

export const weekDays = (monday: DateKey): DateKey[] =>
	Array.from({ length: 7 }, (_, i) => addDays(monday, i));
