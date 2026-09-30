import { z } from 'zod';
import { defineCommand } from '$lib/server/commands/define';
import { id, isoDateTime } from '$lib/server/commands/schemas';
import type { PlanningModule } from '../application/availabilities';

const status = z.enum(['available', 'maybe']);

export const planningCommands = (planning: PlanningModule) => ({
	'availability.create': defineCommand(
		z.object({ startsAt: isoDateTime, endsAt: isoDateTime, status }),
		(actor, input) => planning.create(actor, input)
	),
	'availability.update': defineCommand(
		z.object({
			id,
			changes: z.object({ startsAt: isoDateTime, endsAt: isoDateTime, status }).partial()
		}),
		(actor, input) => planning.update(actor, input)
	),
	'availability.delete': defineCommand(z.object({ id }), (actor, input) =>
		planning.remove(actor, input)
	)
});
