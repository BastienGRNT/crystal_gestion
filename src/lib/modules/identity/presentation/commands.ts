import { z } from 'zod';
import { defineCommand } from '$lib/server/commands/define';
import type { IdentityModule } from '..';

export const identityCommands = (identity: IdentityModule) => ({
	'identity.updatePreferences': defineCommand(
		z.object({ taskView: z.enum(['kanban', 'todo']).optional() }),
		(actor, preferences) => identity.updatePreferences(actor.id, preferences)
	)
});
