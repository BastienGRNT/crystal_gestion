import { addDays, toDateKey } from '$lib/modules/kernel/domain/dates';

/** One-click due dates, as people say them. */
export function dueChoices(today: Date): { label: string; value: string | null }[] {
	const nextMonday = addDays(today, (8 - today.getDay()) % 7 || 7);
	return [
		{ label: 'Aujourd’hui', value: toDateKey(today) },
		{ label: 'Demain', value: toDateKey(addDays(today, 1)) },
		{ label: 'Lundi prochain', value: toDateKey(nextMonday) },
		{ label: 'Dans une semaine', value: toDateKey(addDays(today, 7)) },
		{ label: 'Aucune', value: null }
	];
}
