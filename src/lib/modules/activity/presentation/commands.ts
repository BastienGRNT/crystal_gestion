import { z } from 'zod';
import { command, id } from '$lib/server/commands/define';
import type { ActivityModule } from '../index';

export const activityCommands = (activity: ActivityModule) => ({
	'notifications.read': command(
		z.object({ ids: z.union([z.array(id).max(200), z.literal('all')]) }),
		({ userId }, input) => activity.markRead(userId, input.ids)
	),
	'activity.seen': command(z.object({ projectId: id }), ({ userId }, input) =>
		activity.markSeen(userId, input.projectId)
	)
});
