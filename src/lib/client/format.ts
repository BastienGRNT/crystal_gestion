const relative = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' });
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
	['day', 86_400_000],
	['hour', 3_600_000],
	['minute', 60_000]
];

export function timeAgo(iso: string, now = Date.now()): string {
	const diff = Date.parse(iso) - now;
	for (const [unit, ms] of UNITS)
		if (Math.abs(diff) >= ms) return relative.format(Math.round(diff / ms), unit);
	return 'à l’instant';
}

export const formatDay = (
	date: Date | string,
	options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' }
) =>
	new Intl.DateTimeFormat('fr-FR', options).format(
		typeof date === 'string' ? new Date(date) : date
	);

export const formatTime = (iso: string) =>
	new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso));

/** "12 oct." for a YYYY-MM-DD due date, read in local time. */
export function formatDueDate(dateKey: string): string {
	const [year, month, day] = dateKey.split('-').map(Number);
	return formatDay(new Date(year, month - 1, day), { day: 'numeric', month: 'short' });
}
