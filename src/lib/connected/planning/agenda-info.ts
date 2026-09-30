import { formatDay, formatTime } from '$lib/client/format';
import { overlaps, type Availability } from '$lib/modules/planning/domain/availability';
import { formatMinutes, type TimeEntry } from '$lib/modules/time/domain/time-entry';

const when = (from: string, to: string, running = false) => {
	const minutes = Math.round((Date.parse(to) - Date.parse(from)) / 60_000);
	const day = formatDay(from, { weekday: 'long', day: 'numeric', month: 'long' });
	const end = running ? 'en cours' : formatTime(to);
	return [`${day} · ${formatTime(from)}–${end}`, `Durée : ${formatMinutes(minutes)}`];
};

/** Whether the person had said they were available while they worked. */
function availabilityDuring(entry: TimeEntry, to: string, slots: Availability[]) {
	const mine = slots.filter(
		(s) => s.userId === entry.userId && overlaps(s, { startsAt: entry.startedAt, endsAt: to })
	);
	if (mine.some((s) => s.status === 'available')) return 'Pendant une dispo';
	return mine.length ? 'Pendant un « peut-être »' : 'En dehors de ses dispos';
}

export function blockInfo(
	entry: TimeEntry,
	to: string,
	context: {
		task?: { ref: string; title: string };
		feature?: string;
		person: string;
		slots: Availability[];
	}
) {
	const { task, feature, person, slots } = context;
	return {
		title: task ? `${task.ref} · ${task.title}` : 'Temps sans tâche',
		lines: [
			`Feature : ${feature ?? 'aucune'}`,
			`Par ${person}`,
			...when(entry.startedAt, to, entry.endedAt === null),
			availabilityDuring(entry, to, slots)
		]
	};
}

export const slotInfo = (slot: Availability, person: string) => ({
	title: slot.status === 'maybe' ? 'Peut-être dispo' : 'Dispo',
	lines: [person, ...when(slot.startsAt, slot.endsAt)]
});
