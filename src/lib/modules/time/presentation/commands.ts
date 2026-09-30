import { z } from 'zod';
import { defineCommand } from '$lib/server/commands/define';
import { id, isoDateTime, projectScoped } from '$lib/server/commands/schemas';
import type { TimeModule } from '..';

export const timeCommands = (time: TimeModule) => ({
	'time.createBlock': defineCommand(
		projectScoped.extend({ startedAt: isoDateTime, endedAt: isoDateTime, taskId: id.nullable() }),
		(actor, input) => time.createBlock(actor, input)
	),
	'time.updateBlock': defineCommand(
		z.object({
			id,
			changes: z
				.object({ startedAt: isoDateTime, endedAt: isoDateTime, taskId: id.nullable() })
				.partial()
		}),
		(actor, input) => time.updateBlock(actor, input)
	),
	'time.deleteBlock': defineCommand(z.object({ id }), (actor, input) =>
		time.deleteBlock(actor, input)
	),
	'time.log': defineCommand(
		projectScoped.extend({
			taskId: id,
			minutes: z
				.number()
				.int()
				.min(1)
				.max(24 * 60)
		}),
		(actor, input) => time.logTime(actor, input)
	)
});
