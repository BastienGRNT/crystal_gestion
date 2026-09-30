export type AvailabilityStatus = 'available' | 'maybe';

/** Day-by-day availability of a person, shared with every project they belong to. */
export interface Availability {
	id: string;
	userId: string;
	startsAt: string;
	endsAt: string;
	status: AvailabilityStatus;
}

export const DAY_PERIODS = {
	morning: { label: 'Matin', from: 9, to: 12 },
	afternoon: { label: 'Aprèm', from: 14, to: 18 },
	evening: { label: 'Soir', from: 19, to: 23 }
} as const;

export type DayPeriod = keyof typeof DAY_PERIODS;

export function periodSlot(day: Date, period: DayPeriod) {
	const { from, to } = DAY_PERIODS[period];
	const at = (hour: number) =>
		new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour).toISOString();
	return { startsAt: at(from), endsAt: at(to) };
}

export const overlaps = (
	a: { startsAt: string; endsAt: string },
	b: { startsAt: string; endsAt: string }
) => a.startsAt < b.endsAt && b.startsAt < a.endsAt;

export const isOnDay = (slot: { startsAt: string; endsAt: string }, day: Date) => {
	const start = new Date(day.getFullYear(), day.getMonth(), day.getDate());
	const end = new Date(start.getTime() + 86_400_000);
	return overlaps(slot, { startsAt: start.toISOString(), endsAt: end.toISOString() });
};
