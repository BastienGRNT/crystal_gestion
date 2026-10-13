import { addDays, isDateKey, toDateKey, type DateKey } from '../../kernel/domain/dates';
import { ensure } from '../../kernel/domain/errors';
import { normalizeSlots, type Slot } from '../domain/availability';
import type { PlanningDeps } from './ports';

/** Exceptions older than this are history nobody plans with. */
const HISTORY_DAYS = 90;

export const since = (deps: PlanningDeps) => addDays(toDateKey(deps.clock.now()), -HISTORY_DAYS);

async function publish(deps: PlanningDeps, userId: string) {
	const availability = await deps.availability.get(userId, since(deps));
	deps.feed.saved(availability);
	return availability;
}

export const setWeekday =
	(deps: PlanningDeps) => async (userId: string, weekday: number, slots: Slot[]) => {
		ensure(Number.isInteger(weekday) && weekday >= 0 && weekday <= 6, 'Jour invalide.');
		await deps.availability.setWeekday(userId, weekday, normalizeSlots(slots));
		return publish(deps, userId);
	};

export const setDay =
	(deps: PlanningDeps) => async (userId: string, date: DateKey, slots: Slot[]) => {
		ensure(isDateKey(date), 'Date invalide.');
		await deps.availability.setOverride(userId, date, normalizeSlots(slots));
		return publish(deps, userId);
	};

/** Back to the usual week for that day. */
export const resetDay = (deps: PlanningDeps) => async (userId: string, date: DateKey) => {
	ensure(isDateKey(date), 'Date invalide.');
	await deps.availability.clearOverride(userId, date);
	return publish(deps, userId);
};
