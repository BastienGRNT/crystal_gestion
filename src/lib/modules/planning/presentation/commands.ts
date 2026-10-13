import { z } from 'zod';
import { command, dateKey, slots } from '$lib/server/commands/define';
import type { Planning } from '../index';

// Everyone edits their own availability only: the user comes from the session, never the input.
export const planningCommands = (planning: Planning) => ({
	'availability.setWeekday': command(
		z.object({ weekday: z.number().int(), slots }),
		({ userId }, input) => planning.setWeekday(userId, input.weekday, input.slots)
	),
	'availability.setDay': command(z.object({ date: dateKey, slots }), ({ userId }, input) =>
		planning.setDay(userId, input.date, input.slots)
	),
	'availability.resetDay': command(z.object({ date: dateKey }), ({ userId }, input) =>
		planning.resetDay(userId, input.date)
	)
});
