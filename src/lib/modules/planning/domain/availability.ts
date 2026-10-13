import { weekdayOf, type DateKey } from '../../kernel/domain/dates';
import { ensure } from '../../kernel/domain/errors';

/** Wall-clock `HH:MM`, from `00:00` to `24:00`. */
export type Time = string;

export interface Slot {
	start: Time;
	end: Time;
}

/** Seven days, Monday first: the usual week that fills every week by itself. */
export type WeekTemplate = Slot[][];

/** A specific day that differs from the usual week. No slots = not available that day. */
export interface DayOverride {
	date: DateKey;
	slots: Slot[];
}

export interface Availability {
	userId: string;
	template: WeekTemplate;
	overrides: DayOverride[];
}

export const PRESETS = [
	{ key: 'morning', label: 'Matin', slot: { start: '09:00', end: '12:00' } },
	{ key: 'afternoon', label: 'Après-midi', slot: { start: '14:00', end: '18:00' } },
	{ key: 'evening', label: 'Soir', slot: { start: '19:00', end: '23:00' } }
] as const;

const TIME = /^(([01]\d|2[0-3]):[0-5]\d|24:00)$/;

export const toMinutes = (time: Time) => {
	const [h, m] = time.split(':').map(Number);
	return h * 60 + m;
};

export const fromMinutes = (minutes: number): Time =>
	`${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

export const emptyWeek = (): WeekTemplate => Array.from({ length: 7 }, () => []);

/** Sorted, with touching or overlapping slots merged: 9–12 + 11–14 reads as 9–14. */
export function normalizeSlots(slots: Slot[]): Slot[] {
	ensure(slots.length <= 12, 'Trop de créneaux dans une journée.');
	for (const slot of slots) {
		ensure(TIME.test(slot.start) && TIME.test(slot.end), 'Heure invalide (format 14:30).');
		ensure(toMinutes(slot.start) < toMinutes(slot.end), 'Un créneau doit finir après son début.');
	}
	const sorted = [...slots].sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
	const merged: Slot[] = [];
	for (const slot of sorted) {
		const last = merged.at(-1);
		if (last && toMinutes(slot.start) <= toMinutes(last.end)) {
			if (toMinutes(slot.end) > toMinutes(last.end)) last.end = slot.end;
		} else merged.push({ ...slot });
	}
	return merged;
}

export const overrideOn = (availability: Availability, date: DateKey) =>
	availability.overrides.find((o) => o.date === date) ?? null;

export const slotsOn = (availability: Availability, date: DateKey): Slot[] =>
	overrideOn(availability, date)?.slots ?? availability.template[weekdayOf(date)] ?? [];

/** When both are free: what makes a call or a pairing session possible. */
export function overlap(a: Slot[], b: Slot[]): Slot[] {
	const shared: Slot[] = [];
	for (const x of a)
		for (const y of b) {
			const start = Math.max(toMinutes(x.start), toMinutes(y.start));
			const end = Math.min(toMinutes(x.end), toMinutes(y.end));
			if (start < end) shared.push({ start: fromMinutes(start), end: fromMinutes(end) });
		}
	return normalizeSlots(shared);
}

export type NowState =
	| { state: 'available'; until: Time }
	| { state: 'later'; from: Time }
	| { state: 'done' }
	| { state: 'off' };

/** "Dispo jusqu'à 23h", "Dispo à 19h", or nothing left today. */
export function availabilityAt(slots: Slot[], time: Time): NowState {
	if (!slots.length) return { state: 'off' };
	const now = toMinutes(time);
	const current = slots.find((s) => toMinutes(s.start) <= now && now < toMinutes(s.end));
	if (current) return { state: 'available', until: current.end };
	const next = slots.find((s) => toMinutes(s.start) > now);
	return next ? { state: 'later', from: next.start } : { state: 'done' };
}

export const totalMinutes = (slots: Slot[]) =>
	slots.reduce((sum, s) => sum + toMinutes(s.end) - toMinutes(s.start), 0);
