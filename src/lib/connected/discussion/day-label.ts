import { formatDay } from '$lib/client/format';
import { daysUntil, toDateKey } from '$lib/modules/kernel/domain/dates';

export const sameDay = (a: string, b: string) => toDateKey(new Date(a)) === toDateKey(new Date(b));

export function dayLabel(iso: string, today: Date): string {
	const age = -daysUntil(toDateKey(new Date(iso)), today);
	if (age === 0) return 'Aujourd’hui';
	if (age === 1) return 'Hier';
	return formatDay(iso);
}
