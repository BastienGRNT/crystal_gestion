import { rangeLabel } from '$lib/client/format';
import {
	overlaps,
	type AvailabilitySlot,
	type WorkBlock
} from '$lib/modules/planning/domain/availability';

const longDay = new Intl.DateTimeFormat('fr-FR', {
	weekday: 'long',
	day: 'numeric',
	month: 'long'
});

export function duration(from: string, to: string) {
	const minutes = Math.round((Date.parse(to) - Date.parse(from)) / 60_000);
	const hours = Math.floor(minutes / 60);
	const rest = minutes % 60;
	if (!hours) return `${rest} min`;
	return rest ? `${hours} h ${String(rest).padStart(2, '0')}` : `${hours} h`;
}

const when = (from: string, to: string) => [
	`${longDay.format(new Date(from))} · ${rangeLabel(from, to)}`,
	`Durée : ${duration(from, to)}`
];

/** Whether the person had said they were available for this block. */
function availabilityDuring(block: WorkBlock, slots: AvailabilitySlot[]) {
	const mine = slots.filter((s) => s.userId === block.userId && overlaps(s, block));
	if (mine.some((s) => s.status === 'available')) return 'Pendant une dispo';
	return mine.length ? 'Pendant un « peut-être »' : 'En dehors de ses dispos';
}

export function blockInfo(
	block: WorkBlock,
	task: { number: number; title: string } | undefined,
	person: string,
	slots: AvailabilitySlot[]
) {
	return {
		title: task ? `#${task.number} · ${task.title}` : 'Travail sans tâche',
		lines: [
			`Par ${person}`,
			...when(block.startsAt, block.endsAt),
			availabilityDuring(block, slots)
		]
	};
}

export const slotInfo = (slot: AvailabilitySlot, person: string) => ({
	title: slot.status === 'maybe' ? 'Peut-être dispo' : 'Dispo',
	lines: [person, ...when(slot.startsAt, slot.endsAt)]
});
