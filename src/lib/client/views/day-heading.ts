import { daysUntil } from '$lib/modules/kernel/domain/dates';

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const format = (date: Date, options: Intl.DateTimeFormatOptions) =>
	new Intl.DateTimeFormat('fr-FR', options).format(date);

/** A human title for a YYYY-MM-DD day ("Hier", "Lundi", "12 septembre") and its exact date. */
export function dayHeading(day: string, today: Date): { title: string; caption: string } {
	const [year, month, date] = day.split('-').map(Number);
	const value = new Date(year, month - 1, date);
	const ago = -daysUntil(day, today);
	const sameYear = year === today.getFullYear();
	const caption = format(value, {
		day: 'numeric',
		month: 'short',
		year: sameYear ? undefined : 'numeric'
	});
	if (ago === 0) return { title: 'Aujourd’hui', caption };
	if (ago === 1) return { title: 'Hier', caption };
	if (ago > 1 && ago < 7) return { title: capitalize(format(value, { weekday: 'long' })), caption };
	const title = format(value, { day: 'numeric', month: 'long' });
	return { title, caption: sameYear ? format(value, { weekday: 'long' }) : String(year) };
}
