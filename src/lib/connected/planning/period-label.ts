import { formatDay } from '$lib/client/format';
import type { AgendaDay } from '$lib/ui/organisms/agenda/types';
import { dayKey, sameDay } from '$lib/modules/planning/domain/calendar';

const short = { day: 'numeric', month: 'short' } as const;

/** "28 sept. – 4 oct." for a week, "mercredi 30 septembre" for a single day. */
export function periodLabel(days: Date[]) {
	if (days.length === 1) return formatDay(days[0]);
	return `${formatDay(days[0], short)} – ${formatDay(days.at(-1)!, short)}`;
}

export const agendaDays = (days: Date[], today: Date): AgendaDay[] =>
	days.map((day) => ({
		key: dayKey(day),
		weekday: formatDay(day, { weekday: 'short' }),
		date: String(day.getDate()),
		today: sameDay(day, today)
	}));
