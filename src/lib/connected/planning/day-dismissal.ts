import { dayKey } from '$lib/modules/planning/domain/calendar';

const keyFor = (day: Date) => `crystal-not-available-${dayKey(day)}`;

/** "Pas dispo" is remembered per day and per browser; blocked storage just means the prompt shows again. */
export function isDismissed(day: Date) {
	try {
		return localStorage.getItem(keyFor(day)) === '1';
	} catch {
		return false;
	}
}

export function dismiss(day: Date) {
	try {
		localStorage.setItem(keyFor(day), '1');
	} catch {
		// Hidden for this visit only.
	}
}
