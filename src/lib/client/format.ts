import {
	daysBetween,
	parseDateKey,
	toDateKey,
	type DateKey
} from '$lib/modules/kernel/domain/dates';

const fr = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('fr-FR', options);
const weekdayDay = fr({ weekday: 'short', day: 'numeric' });
const weekdayDayMonth = fr({ weekday: 'short', day: 'numeric', month: 'short' });
const longDay = fr({ weekday: 'long', day: 'numeric', month: 'long' });
const dayMonth = fr({ day: 'numeric', month: 'short' });
const clock = fr({ hour: '2-digit', minute: '2-digit' });
const weekday = fr({ weekday: 'long' });

export const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name;

export const initials = (name: string) =>
	name
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? '')
		.join('');

export function relativeTime(iso: string, now: Date): string {
	const minutes = Math.round((now.getTime() - Date.parse(iso)) / 60_000);
	if (minutes < 1) return 'à l’instant';
	if (minutes < 60) return `il y a ${minutes} min`;
	const hours = Math.round(minutes / 60);
	if (hours < 24) return `il y a ${hours} h`;
	const days = Math.round(hours / 24);
	if (days === 1) return 'hier';
	if (days < 7) return `il y a ${days} j`;
	return `le ${dayMonth.format(new Date(iso))}`;
}

export const timeOf = (iso: string) => clock.format(new Date(iso));

/** "aujourd'hui à 09:12", "hier à 18:40", "lundi à 18:40", "le 3 oct.". */
export function momentLabel(iso: string, now: Date): string {
	const date = new Date(iso);
	const days = daysBetween(toDateKey(date), toDateKey(now));
	if (days === 0) return `aujourd’hui à ${timeOf(iso)}`;
	if (days === 1) return `hier à ${timeOf(iso)}`;
	if (days < 7) return `${weekday.format(date)} à ${timeOf(iso)}`;
	return `le ${dayMonth.format(date)}`;
}

export const longDate = (key: DateKey) => longDay.format(parseDateKey(key));

export const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** "Aujourd'hui", "Demain", "Hier", or "ven. 17 oct.". */
export function dayLabel(key: DateKey, today: DateKey): string {
	const days = daysBetween(today, key);
	if (days === 0) return 'Aujourd’hui';
	if (days === 1) return 'Demain';
	if (days === -1) return 'Hier';
	return capitalize((Math.abs(days) < 7 ? weekdayDay : weekdayDayMonth).format(parseDateKey(key)));
}

/** A deadline as it matters: late, today, or when. */
export function dueLabel(key: DateKey, today: DateKey): string {
	const days = daysBetween(today, key);
	if (days < 0) return days === -1 ? 'En retard d’1 j' : `En retard de ${-days} j`;
	return dayLabel(key, today);
}

/** "19:00–23:00". */
export const rangeLabel = (startsAt: string, endsAt: string) =>
	`${timeOf(startsAt)}–${timeOf(endsAt)}`;

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n > 1 ? many : one}`;

export const dayHeader = (key: DateKey) => capitalize(weekdayDay.format(parseDateKey(key)));

export const monthRange = (from: DateKey, to: DateKey) =>
	`${dayMonth.format(parseDateKey(from))} – ${dayMonth.format(parseDateKey(to))}`;
