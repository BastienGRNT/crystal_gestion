import { dayKey, sameDay } from '$lib/modules/planning/domain/calendar';
import type { AgendaDay, DayMark } from '$lib/ui/organisms/agenda/types';

const short = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
const long = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
const weekday = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' });

/** "12 oct. – 18 oct." for a week, "mercredi 14 octobre" for a single day. */
export function periodLabel(days: Date[]) {
	if (days.length === 1) return long.format(days[0]);
	return `${short.format(days[0])} – ${short.format(days.at(-1)!)}`;
}

export const agendaDays = (days: Date[], today: Date, marks: DayMark[][]): AgendaDay[] =>
	days.map((day, index) => ({
		key: dayKey(day),
		weekday: weekday.format(day),
		date: String(day.getDate()),
		today: sameDay(day, today),
		marks: marks[index] ?? []
	}));
