import type { Moscow } from './feature';

/** Features created during the first day belong to the initial framing, not to a scope change. */
export const FRAMING_PERIOD_MS = 24 * 60 * 60 * 1000;

export type ScopeChange =
	| { change: 'added'; priority: Moscow }
	| { change: 'removed'; priority: Moscow }
	| { change: 'reprioritized'; from: Moscow; to: Moscow };

export const isAfterFraming = (projectCreatedAt: Date, now: Date) =>
	now.getTime() - projectCreatedAt.getTime() > FRAMING_PERIOD_MS;
