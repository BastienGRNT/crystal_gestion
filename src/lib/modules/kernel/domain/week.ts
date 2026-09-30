const DAY_MS = 86_400_000;

/** Monday 00:00 of the current week, local time. */
export function startOfWeek(now: Date): Date {
	const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const weekday = (start.getDay() + 6) % 7;
	return new Date(start.getTime() - weekday * DAY_MS);
}

export const isThisWeek = (iso: string | null, now: Date) => iso !== null && Date.parse(iso) >= startOfWeek(now).getTime();
