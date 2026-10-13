import { toDateKey } from '$lib/modules/kernel/domain/dates';

/** A clock screens can depend on, so "il y a 5 min" and "aujourd'hui" stay true without reload. */
class Now {
	value = $state(new Date());
	today = $derived(toDateKey(this.value));
	time = $derived(
		`${String(this.value.getHours()).padStart(2, '0')}:${String(this.value.getMinutes()).padStart(2, '0')}`
	);

	constructor() {
		if (typeof window !== 'undefined') setInterval(() => (this.value = new Date()), 30_000);
	}
}

export const now = new Now();
