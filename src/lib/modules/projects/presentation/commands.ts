import { z } from 'zod';
import { command, dateKey, id } from '$lib/server/commands/define';
import type { Projects } from '../index';

export const projectCommands = (projects: Projects) => ({
	'projects.create': command(
		z.object({
			id,
			name: z.string(),
			description: z.string().optional(),
			color: z.number().int().optional(),
			deadline: dateKey.nullable().optional()
		}),
		({ userId }, input) => projects.create(input, userId)
	),
	'projects.update': command(
		z.object({
			id,
			name: z.string().optional(),
			description: z.string().optional(),
			color: z.number().int().optional(),
			deadline: dateKey.nullable().optional(),
			weekGoal: z.string().optional(),
			audience: z.string().optional(),
			problem: z.string().optional(),
			payer: z.string().optional(),
			outOfScope: z.string().optional(),
			metricName: z.string().optional(),
			metricTarget: z.number().finite().nullable().optional()
		}),
		({ userId }, { id, ...patch }) => projects.update(id, patch, userId)
	),
	'projects.archive': command(z.object({ id, archived: z.boolean() }), ({ userId }, input) =>
		projects.setArchived(input.id, input.archived, userId)
	),
	'projects.invite': command(z.object({ projectId: id }), ({ userId }, input) =>
		projects.invite(input.projectId, userId)
	),
	'projects.removeMember': command(z.object({ projectId: id, userId: id }), (ctx, input) =>
		projects.removeMember(input.projectId, input.userId, ctx.userId)
	)
});
