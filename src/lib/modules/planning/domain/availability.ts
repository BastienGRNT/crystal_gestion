import { ensure, invalid } from '../../kernel/domain/errors';
import { addDays, startOfWeek } from './calendar';

export type AvailabilityStatus = 'available' | 'maybe';

/** When someone can work: personal, shown in every project they belong to. */
export interface AvailabilitySlot {
	id: string;
	userId: string;
	startsAt: string;
	endsAt: string;
	status: AvailabilityStatus;
}

/** Time planned (or spent) on a project, on a task when there is one. */
export interface WorkBlock {
	id: string;
	projectId: string;
	userId: string;
	taskId: string | null;
	startsAt: string;
	endsAt: string;
}

const DAY_MS = 86_400_000;

export function validRange(startsAt: string, endsAt: string) {
	const start = Date.parse(startsAt);
	const end = Date.parse(endsAt);
	if (Number.isNaN(start) || Number.isNaN(end)) throw invalid('Date invalide.');
	ensure(end > start, 'La fin doit être après le début.');
	ensure(end - start <= DAY_MS, 'Un créneau dure 24 h au plus.');
	return { startsAt: new Date(start).toISOString(), endsAt: new Date(end).toISOString() };
}

/** One-click presets for a day (the grid lets you draw anything else). */
export const DAY_PERIODS = {
	morning: { label: 'Matin', from: 9, to: 12 },
	afternoon: { label: 'Après-midi', from: 14, to: 18 },
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

export function isOnDay(slot: { startsAt: string; endsAt: string }, day: Date) {
	const start = new Date(day.getFullYear(), day.getMonth(), day.getDate());
	const end = new Date(start.getTime() + DAY_MS);
	return overlaps(slot, { startsAt: start.toISOString(), endsAt: end.toISOString() });
}

/**
 * "Copier la semaine dernière": the slots of the week of `from`, moved to the week of `to`,
 * skipping those that would overlap what is already there.
 */
export function copiedWeek(
	slots: AvailabilitySlot[],
	from: Date,
	to: Date
): Omit<AvailabilitySlot, 'id'>[] {
	const source = startOfWeek(from);
	const target = startOfWeek(to);
	const sourceEnd = addDays(source, 7);
	const shift = target.getTime() - source.getTime();
	const existing = slots.filter(
		(s) =>
			Date.parse(s.startsAt) >= target.getTime() &&
			Date.parse(s.startsAt) < addDays(target, 7).getTime()
	);
	const moved = (iso: string) => {
		const date = new Date(Date.parse(iso) + shift);
		// Calendar arithmetic keeps the same wall-clock hour across daylight saving changes.
		const original = new Date(iso);
		date.setHours(original.getHours(), original.getMinutes(), 0, 0);
		return date.toISOString();
	};
	return slots
		.filter(
			(s) =>
				Date.parse(s.startsAt) >= source.getTime() && Date.parse(s.startsAt) < sourceEnd.getTime()
		)
		.map(({ id: _, ...s }) => ({ ...s, startsAt: moved(s.startsAt), endsAt: moved(s.endsAt) }))
		.filter((s) => !existing.some((e) => overlaps(e, s)));
}

export type NowState =
	| { state: 'available'; until: Date; maybe: boolean }
	| { state: 'later'; from: Date; maybe: boolean }
	| { state: 'done' }
	| { state: 'off' };

/** "Dispo jusqu'à 23h", "Dispo à 19h", or nothing left today. */
export function availabilityNow(slots: AvailabilitySlot[], now: Date): NowState {
	const today = slots
		.filter((s) => isOnDay(s, now))
		.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
	if (!today.length) return { state: 'off' };
	const t = now.getTime();
	const current = today.find((s) => Date.parse(s.startsAt) <= t && t < Date.parse(s.endsAt));
	if (current)
		return {
			state: 'available',
			until: new Date(current.endsAt),
			maybe: current.status === 'maybe'
		};
	const next = today.find((s) => Date.parse(s.startsAt) > t);
	return next
		? { state: 'later', from: new Date(next.startsAt), maybe: next.status === 'maybe' }
		: { state: 'done' };
}
