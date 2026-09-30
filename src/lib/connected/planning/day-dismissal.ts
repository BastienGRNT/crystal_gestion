import { readFlag, writeFlag } from '$lib/client/local-flag';
import { dayKey } from '$lib/modules/planning/domain/calendar';

const keyFor = (day: Date) => `crystal-not-available-${dayKey(day)}`;

/** "Pas dispo" is remembered per day and per browser. */
export const isDismissed = (day: Date) => readFlag(keyFor(day));

export const dismiss = (day: Date) => writeFlag(keyFor(day));
