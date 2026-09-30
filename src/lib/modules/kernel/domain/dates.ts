const DAY_MS = 86_400_000;

/** Local calendar date as YYYY-MM-DD. */
export function toDateKey(date: Date): string {
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${date.getFullYear()}-${month}-${day}`;
}

export function daysUntil(dateKey: string, today: Date): number {
	const [year, month, day] = dateKey.split('-').map(Number);
	const target = new Date(year, month - 1, day).getTime();
	const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
	return Math.round((target - start) / DAY_MS);
}

export const minutesBetween = (start: string, end: string) =>
	Math.max(0, Math.round((Date.parse(end) - Date.parse(start)) / 60_000));
