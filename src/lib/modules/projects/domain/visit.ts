export const VISIT_GAP_MS = 60 * 60 * 1000;

export interface VisitState {
	lastSeenAt: Date | null;
	recapSince: Date | null;
}

/**
 * A new visit starts after an hour of inactivity; its recap covers everything since the previous one.
 * The very first visit has no lower bound (`null`): a newcomer sees everything that already happened.
 */
export function registerVisit(state: VisitState, now: Date): VisitState {
	if (!state.lastSeenAt) return { lastSeenAt: now, recapSince: null };
	const isNewVisit = now.getTime() - state.lastSeenAt.getTime() > VISIT_GAP_MS;
	const recapSince = isNewVisit ? state.lastSeenAt : state.recapSince;
	return { lastSeenAt: now, recapSince };
}
