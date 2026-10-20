import { z } from 'zod';
import { command, dateKey, id } from '$lib/server/commands/define';
import { PROJECT_KINDS } from '../domain/project';
import type { Projects } from '../index';

export const projectCommands = (projects: Projects) => ({
	'projects.create': command(
		z.object({
			id,
			name: z.string(),
			description: z.string().optional(),
			color: z.number().int().optional(),
			deadline: dateKey.nullable().optional(),
			kind: z.enum(PROJECT_KINDS).optional()
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
			brief: z.string().max(50_000).optional(),
			techSpec: z.string().max(50_000).optional(),
			kind: z.enum(PROJECT_KINDS).optional(),
			soldDays: z.number().finite().nullable().optional(),
			shipChecklist: z.array(z.string().max(500)).max(50).optional()
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
