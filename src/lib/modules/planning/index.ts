import { resetDay, setDay, setWeekday, since } from './application/manage-availability';
import type { PlanningDeps } from './application/ports';

export function createPlanning(deps: PlanningDeps) {
	return {
		all: () => deps.availability.all(since(deps)),
		setWeekday: setWeekday(deps),
		setDay: setDay(deps),
		resetDay: resetDay(deps)
	};
}

export type Planning = ReturnType<typeof createPlanning>;
