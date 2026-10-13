import { z } from 'zod';
import { command } from '$lib/server/commands/define';
import { WORK_STATUSES } from '../domain/user';
import type { Identity } from '../index';

export const identityCommands = (identity: Identity) => ({
	'me.update': command(
		z.object({
			name: z.string().optional(),
			color: z.number().int().optional(),
			status: z.enum(WORK_STATUSES).optional(),
			statusNote: z.string().nullable().optional()
		}),
		({ userId }, patch) => identity.updateProfile(userId, patch)
	),
	'me.changePassword': command(
		z.object({ current: z.string(), next: z.string() }),
		({ userId, sessionToken }, input) => identity.changePassword(userId, input, sessionToken)
	),
	'team.invite': command(z.object({}), ({ userId }) => identity.createInvitation(userId))
});
